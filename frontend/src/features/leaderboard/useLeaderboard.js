// src/features/leaderboard/useLeaderboard.js

import { useState, useEffect, useCallback } from "react";
import { leaderboardService } from "../../services/api";

const useLeaderboard = () => {
  const [board,   setBoard]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  const fetchBoard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await leaderboardService.getLeaderboard();

      if (Array.isArray(res.data)) {
        setBoard(res.data);
      } else {
        setBoard([]);
        setError("Invalid data received.");
      }
    } catch (err) {
      setBoard([]);
      setError(
        err.response?.data?.message ||
        "Failed to load leaderboard."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBoard();
  }, [fetchBoard]);

  return { board, loading, error, refetch: fetchBoard };
};

export default useLeaderboard;