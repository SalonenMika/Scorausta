import * as SQLite from "expo-sqlite";

// Avaa tietokanta
const db = SQLite.openDatabaseSync("golf_scores.db");

// ✅ Luo taulut, jos niitä ei ole
export const initDatabase = async () => {
    await db.execAsync(
        `CREATE TABLE IF NOT EXISTS rounds (
            id INTEGER PRIMARY KEY AUTOINCREMENT, 
            course_name TEXT, 
            club_name TEXT, 
            date TEXT
        );`
    );

    // Luo taulu väylien tietojen tallentamista varten
    await db.execAsync(
        `CREATE TABLE IF NOT EXISTS holes (
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
        );`
    );
};

// ✅ Poistaa kierroksen ID:n perusteella
export const deleteRoundById = async (id: number) => {
    await db.runAsync(`DELETE FROM holes WHERE round_id = ?;`, [id]);
    await db.runAsync(`DELETE FROM rounds WHERE id = ?;`, [id]);
};

// ✅ Tallentaa uuden kierroksen ja väylien tiedot
export const saveRound = async (course_name: string, club_name: string, scores: Record<number, any>, vaylat: Record<number, any>) => {
    const date = new Date().toISOString();

    // Tallennetaan kierros
    const result = await db.runAsync(
        `INSERT INTO rounds (course_name, club_name, date) VALUES (?, ?, ?);`,
        [course_name, club_name, date]
    );

    // Haetaan tallennetun kierroksen ID
    const roundId = result.lastInsertRowId;

    // Tallennetaan väylien tiedot
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
                score.strokes || null,
                score.putts || null,
                score.gir || null
            ]
        );
    }

    console.log("Kierros ja väylien tiedot tallennettu SQLite:hen!", {holeNumber: vaylat}, {scores});
};

// ✅ Hakee kaikki kierrokset
export const getRounds = async () => {
    return await db.getAllAsync(`SELECT * FROM rounds;`);
};

// ✅ Hakee yksittäisen kierroksen ID:n perusteella
export const getRoundById = async (id: number) => {
    const result = await db.getAllAsync(`SELECT * FROM rounds WHERE id = ?;`, [id]);
    return result.length > 0 ? result[0] : null;
};

// ✅ **Hakee viimeisimmän kierroksen**
export const getLastRound = async () => {
    const result = await db.getAllAsync(`SELECT * FROM rounds ORDER BY date DESC LIMIT 1;`);
    return result.length > 0 ? result[0] : null;
};

// ✅ Hakee väylien tiedot kierrokselle ID:n perusteella
export const getHolesByRoundId = async (roundId: number) => {
    const result = await db.getAllAsync(`SELECT * FROM holes WHERE round_id = ?;`, [roundId]);
    return result;
};
