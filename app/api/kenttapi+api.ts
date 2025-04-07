export function GET() {
    const data = [
        { 
            id: 1,
            club_name: "Jyvas-golf",
            course_name: "Course No. 1",
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
            }
        },
        { 
            id: 2,
            club_name: "Muuramegolf",
            course_name: "Course No. 2",
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
  