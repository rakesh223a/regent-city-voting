import React, { useState, useEffect, useRef  } from "react";
import "./App.css";
import { supabase } from "./supabaseClient";
import colorOptions from "./colorOptions";

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

const blockFlatsMap = {
  "1": ["GA", "GB", "1A", "1B", "1C", "1D", "2A", "2B", "2C", "2D", "3A", "3B", "3C", "3D", "4A", "4B", "4C", "4D"],
  "2": ["GA", "GB", "1A", "1B", "1C", "1D", "2A", "2B", "2C", "2D", "3A", "3B", "3C", "3D", "4A", "4B", "4C", "4D"],
  "3": ["GA", "GB", "1A", "1B", "1C", "1D", "1E", "2A", "2B", "2C", "2D", "2E", "3A", "3B", "3C", "3D", "3E", "4A", "4B", "4C", "4D", "4E"],
  "4": ["GA", "GB", "1A", "1B", "1C", "1D", "2A", "2B", "2C", "2D", "3A", "3B", "3C", "3D", "4A", "4B", "4C", "4D"],
  "5": ["GA", "GB", "1A", "1B", "1C", "2A", "2B", "2C", "2D", "3A", "3B", "3C", "4A", "4B", "4C"],
  "6": ["GA", "GB", "1A", "1B", "1C", "1D", "2A", "2B", "2C", "2D", "3A", "3B", "3C", "3D", "4A", "4B", "4C", "4D"],
  "7": ["GA", "GB", "GC", "GD", "GE", "GF", "GG", "GH", "GI", "GJ", "1A", "1B", "1C", "1D", "1E", "1F", "1G", "1H", "1I", "1J", "2A", "2B", "2C", "2D", "2E", "2F", "2G", "2H", "2I", "2J", "3A", "3B", "3C", "3D", "3E", "3F", "3G", "3H", "3I", "3J", "4A", "4B", "4C", "4D", "4E", "4F", "4G", "4H", "4I", "4J"],
  "8": ["GA", "GB", "GC", "GD", "GE", "1A", "1B", "1C", "1D", "1E", "1F", "1G", "1H", "1I", "1J", "2A", "2B", "2C", "2D", "2E", "2F", "2G", "2H", "2I", "2J", "3A", "3B", "3C", "3D", "3E", "3F", "3G", "3H", "3I", "3J", "4A", "4B", "4C", "4D", "4E", "4F", "4G", "4H", "4I", "4J"],
  "9": ["1A", "1B", "1C", "1D", "2A", "2B", "2C", "2D", "3A", "3B", "3C", "3D", "4A", "4B", "4C", "4D"],
  "10": ["GB", "1A", "1B", "1C", "1D", "1E", "2A", "2B", "2C", "2D", "3A", "3B", "3C", "3D", "3E", "4A", "4B", "4C", "4D"],
  "11": ["GA", "GB", "GC", "1A", "1B", "1C", "2A", "2B", "2C", "3A", "3B", "3C", "4A"],
  "12A": ["1A", "1B", "1C", "1D", "1E", "1F", "2A", "2B", "2C", "2D", "2E", "2F", "3A", "3B", "3C", "3E", "3F", "4A", "4B", "4C", "4E", "4F"],
  "12B": ["1A", "1B", "1D", "1E", "1F", "1G", "1H", "1I", "2A", "2B", "2C", "2D", "2E", "2F", "2H", "2I", "3A", "3B", "3C", "3D", "3E", "3F", "3G", "3H", "3I", "4A", "4B", "4C", "4D", "4E", "4F", "4G", "4H", "4I"],
};

const generateFlats = (block) => {
  return blockFlatsMap[block] || [];
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

    setAvailableFlats(generateFlats(block));
  };

  const submitVote = async () => {
    if (!selected) {
      alert("Please select a color option");
      return;
    }

    if (!form.name || !form.block || !form.flat) {
      alert("Name,Block & Flat are mandatory 🚫");
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

            {option.image && (
              <img
                src={option.image}
                alt={option.name}
                className="building-img"
              />
            )}

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
