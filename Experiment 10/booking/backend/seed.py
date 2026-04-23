from database import SessionLocal, engine, Base
import models
import datetime
from services.search_index import index_events_in_es

# ₹1 = ~$0.012 so prices in INR (150-400 range)
MOVIES = [
    # --- HOLLYWOOD ---
    {
        "title": "Interstellar",
        "description": "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival. A visually stunning, emotionally resonant sci-fi epic.",
        "location": "PVR: Grand Horizon IMAX, Sector 29, Gurugram",
        "date": datetime.datetime(2024, 10, 24, 20, 0),
        "image_url": "https://images.unsplash.com/photo-1506443432602-ac2fcd6f54e0?auto=format&fit=crop&w=700&q=80",
        "genre": "Sci-Fi / Drama", "language": "English", "duration_mins": 169,
        "rating": 8.7, "cast_info": "Matthew McConaughey, Anne Hathaway, Jessica Chastain",
        "ticket_price": 350.0, "rows": ["A","B","C","D","E","F"], "cols": 12,
        "booked": ["A1","A2","B5","B6","C3","D11","D12","E7"]
    },
    {
        "title": "Dune: Part Two",
        "description": "Paul Atreides unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family.",
        "location": "INOX: Nexus Mall, Koramangala, Bangalore",
        "date": datetime.datetime(2024, 11, 2, 19, 30),
        "image_url": "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=700&q=80",
        "genre": "Sci-Fi / Adventure", "language": "English", "duration_mins": 166,
        "rating": 8.5, "cast_info": "Timothée Chalamet, Zendaya, Austin Butler",
        "ticket_price": 400.0, "rows": ["A","B","C","D","E"], "cols": 10,
        "booked": ["A1","A10","B3","C5","C6","D2","D9"]
    },
    {
        "title": "Oppenheimer",
        "description": "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.",
        "location": "Cinépolis: DLF Promenade, New Delhi",
        "date": datetime.datetime(2024, 12, 7, 18, 0),
        "image_url": "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=700&q=80",
        "genre": "Biography / History", "language": "English", "duration_mins": 180,
        "rating": 8.9, "cast_info": "Cillian Murphy, Emily Blunt, Robert Downey Jr.",
        "ticket_price": 300.0, "rows": ["A","B","C","D"], "cols": 8,
        "booked": ["A2","B4","C1","D8"]
    },
    {
        "title": "Avengers: Endgame",
        "description": "After the devastating events of Infinity War, the Avengers assemble once more in order to undo Thanos's actions and restore order to the universe.",
        "location": "PVR: Phoenix Marketcity, Mumbai",
        "date": datetime.datetime(2024, 12, 15, 21, 0),
        "image_url": "https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=700&q=80",
        "genre": "Action / Superhero", "language": "English", "duration_mins": 181,
        "rating": 8.4, "cast_info": "Robert Downey Jr., Chris Evans, Scarlett Johansson",
        "ticket_price": 380.0, "rows": ["A","B","C","D","E","F","G"], "cols": 14,
        "booked": ["A1","A2","A14","B7","C3","C4","D10","E5","F12","G1"]
    },
    {
        "title": "The Dark Knight",
        "description": "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests.",
        "location": "INOX: City Square, Kolkata",
        "date": datetime.datetime(2024, 12, 20, 20, 30),
        "image_url": "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?auto=format&fit=crop&w=700&q=80",
        "genre": "Action / Crime", "language": "English", "duration_mins": 152,
        "rating": 9.0, "cast_info": "Christian Bale, Heath Ledger, Aaron Eckhart",
        "ticket_price": 320.0, "rows": ["A","B","C","D","E"], "cols": 10,
        "booked": ["A5","B2","B9","C7","D1","D10"]
    },
    {
        "title": "Inception",
        "description": "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
        "location": "Cinépolis: Viviana Mall, Thane",
        "date": datetime.datetime(2025, 1, 5, 19, 0),
        "image_url": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=700&q=80",
        "genre": "Sci-Fi / Thriller", "language": "English", "duration_mins": 148,
        "rating": 8.8, "cast_info": "Leonardo DiCaprio, Joseph Gordon-Levitt, Elliot Page",
        "ticket_price": 280.0, "rows": ["A","B","C","D"], "cols": 10,
        "booked": ["A3","B6","C2","D8"]
    },
    {
        "title": "Avatar: The Way of Water",
        "description": "Jake Sully and Ney'tiri have formed a family and are doing everything to stay together. However they must leave their home and explore the regions of Pandora.",
        "location": "PVR: VR Chennai, IMAX 3D",
        "date": datetime.datetime(2025, 1, 12, 18, 30),
        "image_url": "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=700&q=80",
        "genre": "Sci-Fi / Adventure", "language": "English", "duration_mins": 192,
        "rating": 7.6, "cast_info": "Sam Worthington, Zoe Saldana, Sigourney Weaver",
        "ticket_price": 450.0, "rows": ["A","B","C","D","E","F"], "cols": 12,
        "booked": ["A1","A12","B4","B8","C6","D3","D9","E11"]
    },
    {
        "title": "The Batman",
        "description": "In his second year of fighting crime, Batman uncovers corruption in Gotham City that connects to his own family while facing a serial killer known as the Riddler.",
        "location": "INOX: Lulu Mall, Kochi",
        "date": datetime.datetime(2025, 1, 18, 20, 0),
        "image_url": "https://images.unsplash.com/photo-1531259683007-016a7b628fc3?auto=format&fit=crop&w=700&q=80",
        "genre": "Action / Mystery", "language": "English", "duration_mins": 176,
        "rating": 7.8, "cast_info": "Robert Pattinson, Zoë Kravitz, Paul Dano",
        "ticket_price": 300.0, "rows": ["A","B","C","D","E"], "cols": 10,
        "booked": ["A2","B7","C4","D1","D10"]
    },
    {
        "title": "Top Gun: Maverick",
        "description": "After more than thirty years of service, Pete 'Maverick' Mitchell is where he belongs, pushing the envelope as a courageous test pilot.",
        "location": "PVR: Ambience Mall, Gurugram",
        "date": datetime.datetime(2025, 1, 25, 19, 30),
        "image_url": "https://images.unsplash.com/photo-1569949381669-ecf31ae8e613?auto=format&fit=crop&w=700&q=80",
        "genre": "Action / Drama", "language": "English", "duration_mins": 130,
        "rating": 8.3, "cast_info": "Tom Cruise, Miles Teller, Jennifer Connelly",
        "ticket_price": 350.0, "rows": ["A","B","C","D"], "cols": 12,
        "booked": ["A4","B2","B11","C8","D5"]
    },
    {
        "title": "Mission: Impossible – Dead Reckoning",
        "description": "Ethan Hunt and his IMF team must track down a terrifying new weapon that threatens all of humanity before it falls into the wrong hands.",
        "location": "Cinépolis: Select Citywalk, New Delhi",
        "date": datetime.datetime(2025, 2, 1, 20, 30),
        "image_url": "https://images.unsplash.com/photo-1502700807168-484a3e7889d0?auto=format&fit=crop&w=700&q=80",
        "genre": "Action / Thriller", "language": "English", "duration_mins": 163,
        "rating": 7.7, "cast_info": "Tom Cruise, Hayley Atwell, Ving Rhames",
        "ticket_price": 320.0, "rows": ["A","B","C","D","E"], "cols": 10,
        "booked": ["A1","B5","C3","C9","D7","E2"]
    },
    {
        "title": "Spider-Man: No Way Home",
        "description": "With Spider-Man's identity now revealed, Peter asks Doctor Strange for help. When a spell goes wrong, dangerous foes from other worlds start to appear.",
        "location": "INOX: R City Mall, Mumbai",
        "date": datetime.datetime(2025, 2, 8, 18, 0),
        "image_url": "https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=700&q=80",
        "genre": "Action / Fantasy", "language": "English", "duration_mins": 148,
        "rating": 8.2, "cast_info": "Tom Holland, Zendaya, Benedict Cumberbatch",
        "ticket_price": 380.0, "rows": ["A","B","C","D","E","F"], "cols": 12,
        "booked": ["A6","B3","C8","D4","D11","E2","F9"]
    },
    # --- BOLLYWOOD ---
    {
        "title": "Jawan",
        "description": "A high-octane action thriller that explores the harrowing injustices of the nation and raises voice against corruption, power, and inequality.",
        "location": "PVR: Phoenix Palladium, Mumbai",
        "date": datetime.datetime(2025, 2, 14, 19, 0),
        "image_url": "https://images.unsplash.com/photo-1516912481808-3406841bd33c?auto=format&fit=crop&w=700&q=80",
        "genre": "Action / Thriller", "language": "Hindi", "duration_mins": 169,
        "rating": 7.0, "cast_info": "Shah Rukh Khan, Nayanthara, Vijay Sethupathi",
        "ticket_price": 250.0, "rows": ["A","B","C","D","E"], "cols": 12,
        "booked": ["A1","A2","B7","C4","D10","E3"]
    },
    {
        "title": "Animal",
        "description": "A son's love and obsession for his father crosses all lines of morality and legality leading to mayhem, violence, and a heartbreaking journey.",
        "location": "Cinépolis: Orion Mall, Bangalore",
        "date": datetime.datetime(2025, 2, 20, 21, 0),
        "image_url": "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=700&q=80",
        "genre": "Action / Drama", "language": "Hindi", "duration_mins": 201,
        "rating": 6.6, "cast_info": "Ranbir Kapoor, Rashmika Mandanna, Anil Kapoor",
        "ticket_price": 280.0, "rows": ["A","B","C","D","E","F"], "cols": 10,
        "booked": ["A5","B2","B9","C6","D3","D8","E1","F10"]
    },
    {
        "title": "Dunki",
        "description": "A heartfelt journey of four friends who set out on a daring adventure to fulfil their dreams of settling abroad through an illegal route called 'Donkey flight'.",
        "location": "INOX: Logix City Centre, Noida",
        "date": datetime.datetime(2025, 3, 1, 18, 30),
        "image_url": "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=700&q=80",
        "genre": "Drama / Comedy", "language": "Hindi", "duration_mins": 161,
        "rating": 6.4, "cast_info": "Shah Rukh Khan, Taapsee Pannu, Boman Irani",
        "ticket_price": 220.0, "rows": ["A","B","C","D"], "cols": 10,
        "booked": ["A3","B6","C1","D9"]
    },
    {
        "title": "Pushpa: The Rule – Part 2",
        "description": "Pushpa Raj continues his ruthless rise through the smuggling world, now at the peak of his power and facing even deadlier rivals and consequences.",
        "location": "PVR: Nexus Elante, Chandigarh",
        "date": datetime.datetime(2025, 3, 10, 20, 0),
        "image_url": "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=700&q=80",
        "genre": "Action / Thriller", "language": "Telugu / Hindi", "duration_mins": 185,
        "rating": 7.5, "cast_info": "Allu Arjun, Rashmika Mandanna, Fahadh Faasil",
        "ticket_price": 300.0, "rows": ["A","B","C","D","E","F"], "cols": 12,
        "booked": ["A2","A11","B4","C7","D3","E9","F1","F12"]
    },
    {
        "title": "Kalki 2898 AD",
        "description": "In a dystopian future India, a mighty warrior rises to protect the last hope of humanity — the unborn child who might be the divine incarnation destined to restore the world.",
        "location": "INOX: Forum Mall, Hyderabad",
        "date": datetime.datetime(2025, 3, 20, 19, 30),
        "image_url": "https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?auto=format&fit=crop&w=700&q=80",
        "genre": "Sci-Fi / Mythology", "language": "Telugu / Hindi", "duration_mins": 180,
        "rating": 7.3, "cast_info": "Prabhas, Deepika Padukone, Amitabh Bachchan",
        "ticket_price": 350.0, "rows": ["A","B","C","D","E"], "cols": 12,
        "booked": ["A5","B3","B10","C6","D2","D11","E8"]
    },
    {
        "title": "Gladiator II",
        "description": "Years after witnessing the death of the revered hero Maximus at the hands of his uncle, Lucius is forced to enter the Colosseum to fight for the Roman Empire's future.",
        "location": "PVR: Seasons Mall, Pune",
        "date": datetime.datetime(2025, 4, 5, 20, 0),
        "image_url": "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=700&q=80",
        "genre": "Action / Epic", "language": "English", "duration_mins": 148,
        "rating": 7.2, "cast_info": "Paul Mescal, Pedro Pascal, Denzel Washington",
        "ticket_price": 340.0, "rows": ["A","B","C","D","E"], "cols": 10,
        "booked": ["A1","B4","C7","D3","E9"]
    },
    {
        "title": "Deadpool & Wolverine",
        "description": "Deadpool is recruited by the TVA and teams up with a variant of Wolverine to save his universe. Chaos, comedy, and violence ensue.",
        "location": "Cinépolis: Hyderabad Central, Hyderabad",
        "date": datetime.datetime(2025, 4, 15, 21, 0),
        "image_url": "https://images.unsplash.com/photo-1616530940355-351fabd9524b?auto=format&fit=crop&w=700&q=80",
        "genre": "Action / Comedy", "language": "English", "duration_mins": 127,
        "rating": 7.8, "cast_info": "Ryan Reynolds, Hugh Jackman, Emma Corrin",
        "ticket_price": 400.0, "rows": ["A","B","C","D","E","F"], "cols": 12,
        "booked": ["A3","A10","B5","C2","C9","D6","E1","E12","F8"]
    },
    {
        "title": "Stree 2",
        "description": "The beloved Stree returns — but this time, the supernatural horror gets bigger, funnier, and far more terrifying as the town of Chanderi faces a deadlier threat.",
        "location": "PVR: Vegas Mall, Dwarka, Delhi",
        "date": datetime.datetime(2025, 4, 25, 19, 0),
        "image_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=700&q=80",
        "genre": "Horror / Comedy", "language": "Hindi", "duration_mins": 135,
        "rating": 7.9, "cast_info": "Rajkummar Rao, Shraddha Kapoor, Tamannaah Bhatia",
        "ticket_price": 220.0, "rows": ["A","B","C","D"], "cols": 10,
        "booked": ["A2","B5","C8","D3"]
    },
    {
        "title": "Joker: Folie à Deux",
        "description": "Failed comedian Arthur Fleck meets the love of his life, Harley Quinn, while incarcerated at Arkham State Hospital. Upon his release, the two embark on a doomed romantic misadventure.",
        "location": "PVR: Directors Cut, Vasant Kunj, Delhi",
        "date": datetime.datetime(2025, 5, 1, 20, 30),
        "image_url": "https://images.unsplash.com/photo-1531259683007-016a7b628fc3?auto=format&fit=crop&w=700&q=80",
        "genre": "Crime / Drama / Musical", "language": "English", "duration_mins": 138,
        "rating": 5.3, "cast_info": "Joaquin Phoenix, Lady Gaga, Brendan Gleeson",
        "ticket_price": 450.0, "rows": ["A","B","C","D","E"], "cols": 10,
        "booked": ["A1","B2","C3","D4","E5"]
    },
    {
        "title": "K.G.F: Chapter 2",
        "description": "The blood-soaked land of Kolar Gold Fields has a new overlord now - Rocky, whose name strikes fear in the heart of his foes. His allies look up to Rocky as their Savior.",
        "location": "PVR: Orion Mall, Bangalore",
        "date": datetime.datetime(2025, 5, 10, 19, 0),
        "image_url": "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=700&q=80",
        "genre": "Action / Crime", "language": "Kannada / Hindi", "duration_mins": 168,
        "rating": 8.3, "cast_info": "Yash, Sanjay Dutt, Raveena Tandon",
        "ticket_price": 280.0, "rows": ["A","B","C","D","E","F"], "cols": 12,
        "booked": ["A1","A12","B6","C3","D9","F5"]
    },
    {
        "title": "Bhool Bhulaiyaa 3",
        "description": "Rooh Baba is back! This time, the horror and comedy reach new heights as he enters a haunted mansion in Bengal, facing a spirit even more powerful than Manjulika.",
        "location": "Cinépolis: Fun Republic, Lucknow",
        "date": datetime.datetime(2025, 5, 15, 18, 0),
        "image_url": "https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=700&q=80",
        "genre": "Horror / Comedy", "language": "Hindi", "duration_mins": 158,
        "rating": 7.1, "cast_info": "Kartik Aaryan, Vidya Balan, Triptii Dimri",
        "ticket_price": 200.0, "rows": ["A","B","C","D"], "cols": 10,
        "booked": ["A5","B3","C9","D1"]
    },
    {
        "title": "Moana 2",
        "description": "After receiving an unexpected call from her wayfinding ancestors, Moana must journey to the far seas of Oceania and into dangerous, long-lost waters for an adventure unlike anything she's ever faced.",
        "location": "PVR: Superplex, Logix Noida",
        "date": datetime.datetime(2025, 5, 20, 16, 0),
        "image_url": "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=700&q=80",
        "genre": "Animation / Adventure", "language": "English / Hindi", "duration_mins": 100,
        "rating": 7.0, "cast_info": "Auli'i Cravalho, Dwayne Johnson",
        "ticket_price": 320.0, "rows": ["A","B","C","D","E"], "cols": 10,
        "booked": ["A1","B5","C2","D8","E10"]
    },
    {
        "title": "Pathaan",
        "description": "An Indian agent races against a doomsday clock as a ruthless mercenary, with a bitter vendetta, unleashes an apocalyptic attack against the country.",
        "location": "INOX: Insignia, Atria Mall, Mumbai",
        "date": datetime.datetime(2025, 5, 25, 21, 0),
        "image_url": "https://images.unsplash.com/photo-1516912481808-3406841bd33c?auto=format&fit=crop&w=700&q=80",
        "genre": "Action / Thriller", "language": "Hindi", "duration_mins": 146,
        "rating": 5.9, "cast_info": "Shah Rukh Khan, Deepika Padukone, John Abraham",
        "ticket_price": 400.0, "rows": ["A","B","C","D","E","F"], "cols": 12,
        "booked": ["A6","B11","C2","D7","E1","F12"]
    },
    {
        "title": "Leo",
        "description": "A mild-mannered cafe owner becomes a local hero through an act of violence, which sets off a chain of events that connects him to a dark past he thought he'd left behind.",
        "location": "PVR: Grand Galada, Chennai",
        "date": datetime.datetime(2025, 5, 30, 20, 0),
        "image_url": "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=700&q=80",
        "genre": "Action / Crime", "language": "Tamil / Hindi", "duration_mins": 164,
        "rating": 7.2, "cast_info": "Vijay, Sanjay Dutt, Trisha Krishnan",
        "ticket_price": 300.0, "rows": ["A","B","C","D","E"], "cols": 12,
        "booked": ["A1","A2","B5","C8","D11","E4"]
    },
]

def seed_data():
    db = SessionLocal()
    print(f"Seeding {len(MOVIES)} movies...")
    created_events = []

    for m in MOVIES:
        event = models.Event(
            title=m["title"], description=m["description"],
            location=m["location"], date=m["date"],
            image_url=m["image_url"], genre=m["genre"],
            language=m["language"], duration_mins=m["duration_mins"],
            rating=m["rating"], cast_info=m["cast_info"],
            ticket_price=m["ticket_price"]
        )
        db.add(event)
        db.commit()
        db.refresh(event)
        created_events.append(event)

        for row in m["rows"]:
            for col in range(1, m["cols"] + 1):
                sn = f"{row}{col}"
                db.add(models.Seat(
                    event_id=event.id,
                    seat_number=sn,
                    is_booked=(sn in m["booked"])
                ))
        db.commit()

    # Index into Elasticsearch
    index_events_in_es(created_events)

    print("Seeding complete.")
    db.close()

if __name__ == "__main__":
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    seed_data()
