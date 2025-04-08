export function GET() {
    const data = [
        { 
            id: 1,
            club_name: "Jyvas-golf",
            course_name: "Jyväs-Golf",
            location: {
                address: "123 Golf Course Lane, Jyväskylä, Finland",
                city: "Jyväskylä",
                state: "",
                country: "Finland",
                latitude: 62.241622,
                longitude: 25.72088
            },
            vaylat: {
                1: { par: 5, pituus: 300, hcp: 1 },
                2: { par: 3, pituus: 200, hcp: 18 },
                3: { par: 5, pituus: 500, hcp: 11 },
                4: { par: 4, pituus: 300, hcp: 7 },
                5: { par: 4, pituus: 300, hcp: 7 },
                6: { par: 4, pituus: 300, hcp: 7 },
                7: { par: 4, pituus: 300, hcp: 7 },
                8: { par: 4, pituus: 300, hcp: 7 },
                9: { par: 4, pituus: 300, hcp: 7 },
                10: { par: 4, pituus: 300, hcp: 7 },
                11: { par: 4, pituus: 300, hcp: 7 },
                12: { par: 4, pituus: 300, hcp: 7 },
                13: { par: 4, pituus: 300, hcp: 7 },
                14: { par: 4, pituus: 300, hcp: 7 },
                15: { par: 4, pituus: 300, hcp: 7 },
                16: { par: 4, pituus: 300, hcp: 7 },
                17: { par: 4, pituus: 300, hcp: 7 },
                18: { par: 4, pituus: 300, hcp: 7 },
            }
        },
        { 
            id: 2,
            club_name: "Muuramegolf",
            course_name: "Muurame Golf",
            location: {
                address: "tiiboxintie 2, Muurame, Finland",
                city: "Muurame",
                state: "",
                country: "Finland",
                latitude: 62.241622,
                longitude: 25.72088
            },
            vaylat: {
                1: { par: 3, pituus: 300, hcp: 1 },
                2: { par: 4, pituus: 200, hcp: 18 },
                3: { par: 5, pituus: 500, hcp: 11 },
                4: { par: 3, pituus: 300, hcp: 7 },
            }
        },
    ];
    return new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } });
  }
  