import React, { useState, useEffect, useRef  } from "react";
import "./App.css";
import { supabase } from "./supabaseClient";

// ✅ Import Images
import c1Img from "./assets/color1.jpeg";
import c2Img from "./assets/color2.jpeg";
import c3Img from "./assets/color3.jpeg";
import c4Img from "./assets/color4.jpeg";

const blocks = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12A",
  "12B",
];

const colorOptions = [
  {
    id: 1,
    name: "Option 1: Cane Beige & Peanut Butter",
    image: c1Img,
    palette: [
      { name: "Cane Beige", color: "#D2B48C" },
      { name: "Peanut Brown", color: "#b7ac9c" },
    ],
  },
  {
    id: 2,
    name: "Option 2: Palm Beach & Spice Jar",
    image: c2Img,
    palette: [
      { name: "Palm Beach", color: "#e5c6be" },
      { name: "Spice Jar", color: "#a16866" },
    ],
  },
  {
    id: 3,
    name: "Option 3: Morning Glory & Nut Brown",
    image: c3Img,
    palette: [
      { name: "Morning Glory", color: "#dcd8cd" },
      { name: "Nut Brown", color: "#64483f" },
    ],
  },
  {
    id: 4,
    name: "Option 4: Sesame Seed & Warmstone",
    image: c4Img,
    palette: [
      { name: "Sesame Seed", color: "#d7c1aa" },
      { name: "Warmstone", color: "#be9878" },
    ],
  },
];

const generateFlats = () => {
  const flats = [];

  /* Ground Floor */
  const letters = ["A", "B", "C", "D", "E", "F", "G", "H"];

  letters.forEach((letter) => {
    flats.push(`G${letter}`);
  });

  /* Floors 1 → 4 */
  for (let floor = 1; floor <= 4; floor++) {
    letters.forEach((letter) => {
      flats.push(`${floor}${letter}`);
    });
  }

  return flats;
};

const normalize = (str) => str.replace(/\s+/g, " ").trim();

function App() {
  const [selected, setSelected] = useState(null);
  const [availableFlats, setAvailableFlats] = useState([]);
  const [voteCounts, setVoteCounts] = useState({});

  const [form, setForm] = useState({
    name: "",
    block: "",
    flat: "",
    comments: "",
  });

  const fetchResults = async () => {
    const { data, error } = await supabase.from("votes").select("color");

    if (error) {
      console.error(error);
      return;
    }

    const grouped = {};

    data.forEach((vote) => {
      const key = normalize(vote.color);

      grouped[key] = (grouped[key] || 0) + 1;
    });

    setVoteCounts(grouped);
  };

  const handleBlockChange = (block) => {
    setForm({ ...form, block, flat: "" });

    setAvailableFlats(generateFlats());
  };

  const submitVote = async () => {
    if (!selected) {
      alert("Please select a color option");
      return;
    }

    if (!form.name || !form.block || !form.flat) {
      alert("Name, Block & Flat are mandatory 🚫");
      return;
    }

    /* ✅ Build Palette Combination */
    const paletteCombination = selected.palette.map((p) => p.name).join(" + ");

    const { error } = await supabase.from("votes").insert([
      {
        name: form.name,
        block: form.block,
        flat: form.flat,
        color: paletteCombination,
        comments: form.comments,
      },
    ]);

    /* ✅ Smart Error Handling ⭐⭐⭐ */
    if (error) {
      /* PostgreSQL duplicate constraint error */
      if (error.code === "23505") {
        alert("This flat has already voted in the selected block 🚫");
        return;
      }

      /* Any unexpected DB error */
      alert("Something went wrong. Please try again.");
      console.error(error);
      return;
    }

    alert("Vote Submitted ✅");

    setForm({
      name: "",
      block: "",
      flat: "",
      comments: "",
    });

    setSelected(null);
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const formRef = useRef(null);


  return (
    <div className="container">
      {/* ✅ Banner */}
     <div className="top-banner">
  <div className="banner-overlay">
    <h1>Let's Give Regent City a Fresh New Look! ✨</h1>
    <p>
      Help us choose the new exterior color scheme to enhance our society's
      beauty and value.
    </p>
  </div>
</div>


      <div className="options">
        {colorOptions.map((option) => (
          <div
            key={option.id}
            className={`card ${selected?.id === option.id ? "selected" : ""}`}
          >
            {/* ✅ Palette Header ⭐ */}
            <div className="palette-header">
              <div className="palette-strip">
                {option.palette.map((p, index) => (
                  <div
                    key={index}
                    className="palette-color"
                    style={{ backgroundColor: p.color }}
                  />
                ))}
              </div>

              <div className="palette-labels">
                {option.palette.map((p, index) => (
                  <span key={index}>{p.name}</span>
                ))}
              </div>
            </div>

            <img
              src={option.image}
              alt={option.name}
              className="building-img"
            />

            <div className="card-votes">
              {voteCounts[
                normalize(option.palette.map((p) => p.name).join(" + "))
              ] || 0}{" "}
              Votes
            </div>

            <button
              className="select-btn"
              onClick={() => {
                setSelected(option);

                setTimeout(() => {
                  formRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }, 150);
              }}
            >
              Select
            </button>
          </div>
        ))}
      </div>

      {/* ✅ Form */}
      <div className="form" ref={formRef}>

        <input
          placeholder="Resident Name *"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <select
          value={form.block}
          onChange={(e) => handleBlockChange(e.target.value)}
        >
          <option value="">Select Block *</option>

          {blocks.map((block, index) => (
            <option key={index} value={block}>
              Block {block}
            </option>
          ))}
        </select>

        <select
          value={form.flat}
          onChange={(e) => setForm({ ...form, flat: e.target.value })}
          disabled={!availableFlats.length}
        >
          <option value="">Select Flat *</option>

          {availableFlats.map((flat, index) => (
            <option key={index} value={flat}>
              {flat}
            </option>
          ))}
        </select>

        <textarea
          placeholder="Additional Comments (Optional)"
          value={form.comments}
          onChange={(e) => setForm({ ...form, comments: e.target.value })}
        />

        <button className="submit-btn" onClick={submitVote}>
          Submit My Vote
        </button>
      </div>
    </div>
  );
}

export default App;
