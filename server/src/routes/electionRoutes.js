
import express from "express";
const router = express.Router();
import pool from "../db.js";


router.get("/states", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT state FROM election_results ORDER BY state ASC`
    );
    const states = result.rows.map((r) => r.state);
    res.json({ success: true, states });
  } catch (err) {
    console.error("Error fetching states:", err);
    res.status(500).json({ success: false, error: "Failed to fetch states" });
  }
});


router.get("/results", async (req, res) => {
  const { state } = req.query;
  if (!state) {
    return res.status(400).json({ success: false, error: "state param required" });
  }

  try {
    const winnersQuery = `
      WITH ranked AS (
        SELECT
          ac_no,
          ac_name,
          candidate,
          party,
          total_votes,
          vote_share,
          evm_votes,
          postal_votes,
          ROW_NUMBER() OVER (
            PARTITION BY ac_no
            ORDER BY total_votes DESC
          ) AS rank
        FROM election_results
        WHERE state = $1
          AND party != 'None of the Above'
          AND LOWER(candidate) != 'nota'
      )
      SELECT
        ac_no,
        ac_name,
        candidate,
        party,
        total_votes,
        vote_share,
        evm_votes,
        postal_votes
      FROM ranked
      WHERE rank = 1
      ORDER BY ac_no ASC
    `;

    const winnersResult = await pool.query(winnersQuery, [state]);
    const constituencies = winnersResult.rows;

    const partyMap = {};
    for (const row of constituencies) {
      if (!partyMap[row.party]) partyMap[row.party] = 0;
      partyMap[row.party]++;
    }

    const partySummary = Object.entries(partyMap)
      .map(([party, seats]) => ({ party, seats }))
      .sort((a, b) => b.seats - a.seats);

    res.json({
      success: true,
      state,
      totalConstituencies: constituencies.length,
      partySummary,
      constituencies,
    });
  } catch (err) {
    console.error("Error fetching election results:", err);
    res.status(500).json({ success: false, error: "Failed to fetch results" });
  }
});

export default router;
