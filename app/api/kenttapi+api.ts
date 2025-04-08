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
                1: { par: 5, pituus: 512, hcp: 1 },
                2: { par: 4, pituus: 308, hcp: 5 },
                3: { par: 4, pituus: 335, hcp: 11 },
                4: { par: 4, pituus: 310, hcp: 13 },
                5: { par: 3, pituus: 141, hcp: 17 },
                6: { par: 4, pituus: 311, hcp: 7 },
                7: { par: 3, pituus: 132, hcp: 15 },
                8: { par: 4, pituus: 344, hcp: 3 },
                9: { par: 5, pituus: 454, hcp: 9 },
            }
        },
        { 
            id: 2,
            club_name: "Muurame Golf",
            course_name: "Muurame Golf",
            location: { 
                address: "Pyyppöläntie 316, 40950 Muurame, Finland", 
                city: "Muurame", 
                state: "", 
                country: "Finland", 
                latitude: 62.160289, 
                longitude: 25.569192 
            },
            vaylat: {
                1: { par: 5, pituus: 478, hcp: 6 },
                2: { par: 4, pituus: 394, hcp: 2 },
                3: { par: 3, pituus: 162, hcp: 17 },
                4: { par: 4, pituus: 366, hcp: 10 },
                5: { par: 3, pituus: 139, hcp: 14 },
                6: { par: 5, pituus: 502, hcp: 9 },
                7: { par: 4, pituus: 327, hcp: 7 },
                8: { par: 3, pituus: 107, hcp: 16 },
                9: { par: 4, pituus: 380, hcp: 4 },
                10: { par: 4, pituus: 352, hcp: 3 },
                11: { par: 5, pituus: 411, hcp: 13 },
                12: { par: 4, pituus: 408, hcp: 5 },
                13: { par: 3, pituus: 162, hcp: 18 },
                14: { par: 4, pituus: 330, hcp: 11 },
                15: { par: 3, pituus: 168, hcp: 15 },
                16: { par: 5, pituus: 573, hcp: 1 },
                17: { par: 4, pituus: 266, hcp: 12 },
                18: { par: 4, pituus: 295, hcp: 8 }
            }
        },
    ];
    return new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } });
  }
  