import * as SQLite from "expo-sqlite";

// Avaa tietokanta
const db = SQLite.openDatabaseSync("golf_scores.db");

// ✅ Luo taulut, jos niitä ei ole
export const initDatabase = async () => {
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS rounds (
            id INTEGER PRIMARY KEY AUTOINCREMENT, 
            course_name TEXT, 
            club_name TEXT, 
            date TEXT
        );
    `);

    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS holes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            round_id INTEGER, 
            hole_number INTEGER, 
            par INTEGER, 
            pituus INTEGER, 
            hcp INTEGER, 
            strokes INTEGER, 
            putts INTEGER, 
            gir BOOLEAN,
            FOREIGN KEY (round_id) REFERENCES rounds(id)
        );
    `);
};

// ✅ Tyypitykset
export type Hole = {
    id: number;
    round_id: number;
    hole_number: number;
    par: number;
    pituus: number;
    hcp: number;
    strokes: number | null;
    putts: number | null;
    gir: boolean | null;
};

export type Round = {
    id: number;
    course_name: string;
    club_name: string;
    date: string;
};

export type RoundWithHoles = Round & {
    holes: Hole[];
};

// ✅ Tallentaa uuden kierroksen ja väylien tiedot
export const saveRound = async (
    course_name: string,
    club_name: string,
    scores: Record<number, any>,
    vaylat: Record<number, any>
) => {
    const date = new Date().toISOString();

    const result = await db.runAsync(
        `INSERT INTO rounds (course_name, club_name, date) VALUES (?, ?, ?);`,
        [course_name, club_name, date]
    );

    const roundId = result.lastInsertRowId;

    for (const holeNumber in vaylat) {
        const hole = vaylat[holeNumber];
        const score = scores[parseInt(holeNumber)] || {};

        await db.runAsync(
            `INSERT INTO holes (round_id, hole_number, par, pituus, hcp, strokes, putts, gir) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
            [
                roundId,
                holeNumber,
                hole.par,
                hole.pituus,
                hole.hcp,
                score.strokes ?? null,
                score.putts ?? null,
                score.gir ?? null
            ]
        );
    }

    console.log("Kierros ja väylien tiedot tallennettu SQLite:hen!");
};

// ✅ Hakee kaikki kierrokset väylineen
export const getRounds = async (): Promise<RoundWithHoles[]> => {
    const rounds = await db.getAllAsync<Round>(`SELECT * FROM rounds ORDER BY date DESC;`);

    const roundsWithHoles = await Promise.all(
        rounds.map(async (round) => {
            const holes = await db.getAllAsync<Hole>(
                `SELECT * FROM holes WHERE round_id = ?;`,
                [round.id]
            );
            return {
                ...round,
                holes
            };
        })
    );

    return roundsWithHoles;
};

// ✅ Hakee yksittäisen kierroksen ID:n perusteella
export const getRoundById = async (id: number): Promise<RoundWithHoles | null> => {
    const result = await db.getAllAsync<Round>(`SELECT * FROM rounds WHERE id = ?;`, [id]);

    if (result.length > 0) {
        const round = result[0];

        const holes = await db.getAllAsync<Hole>(`SELECT * FROM holes WHERE round_id = ?;`, [id]);

        return {
            ...round,
            holes
        };
    }

    return null;
};

// ✅ Hakee viimeisimmän kierroksen
export const getLastRound = async (): Promise<Round | null> => {
    const result = await db.getAllAsync<Round>(
        `SELECT * FROM rounds ORDER BY date DESC LIMIT 1;`
    );
    return result.length > 0 ? result[0] : null;
};

// ✅ Poistaa kierroksen ID:n perusteella
export const deleteRoundById = async (id: number) => {
    await db.runAsync(`DELETE FROM holes WHERE round_id = ?;`, [id]);
    await db.runAsync(`DELETE FROM rounds WHERE id = ?;`, [id]);
};
