import React, { useState, useEffect } from "react";

const SpeedyAlphabet = () => {
  const [typedText, setTypedText] = useState("");
  const [startTyping, setStartTyping] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState("0.00");
  const [timerRunning, setTimerRunning] = useState(false);
  const [intervalId, setIntervalId] = useState(null);
  const [alphabetTimes, setAlphabetTimes] = useState([]);
  const [tempScore, setTempScore] = useState(null); // Temporary score storage
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userInstagram, setUserInstagram] = useState("");
  const [totalTimeForAlphabet, setTotalTimeForAlphabet] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [highScores, setHighScores] = useState([]); // Initialize state for leaderboard scores
  const [loading, setLoading] = useState(true); // Loading state for async fetch

  useEffect(() => {
    // Fetch the leaderboard when the component is mounted
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch(
          "https://a-to-z-server-oa7r.onrender.com/api/scores"
        );
        if (response.ok) {
          const scores = await response.json();
          console.log("Fetched scores:", scores); // Log to verify the response

          // Sort the scores by time (ascending) and take the top 3
          const topScores = scores.sort((a, b) => a.time - b.time).slice(0, 3);
          setHighScores(topScores); // Set the top 3 scores to state
        } else {
          console.error("Failed to fetch leaderboard");
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    fetchLeaderboard();
  }, []);

  const startTimer = () => {
    if (!timerRunning) {
      const now = Date.now();
      setStartTime(now);
      setTimerRunning(true);
      const id = setInterval(() => {
        setElapsedTime(((Date.now() - now) / 1000).toFixed(2));
      }, 1);
      setIntervalId(id);
    }
  };

  const stopTimer = () => {
    clearInterval(intervalId);
    setTimerRunning(false);
  };

  const handleInputChange = (e) => {
    const inputValue = e.target.value;

    if (inputValue.length > 0) {
      const currentChar = inputValue[inputValue.length - 1].toLowerCase();

      if (!startTyping && inputValue.length > 0) {
        setStartTyping(true);
      }

      if (typedText.length === 0) {
        setElapsedTime("0.00");
      }

      if (currentChar === nextExpectedChar()) {
        if (!timerRunning) startTimer();

        const currentTime = (Date.now() - startTime) / 1000;

        setAlphabetTimes((prevTimes) => [...prevTimes, currentTime]);

        if (inputValue === "abcdefghijklmnopqrstuvwxyz") {
          stopTimer();
          const totalTime = elapsedTime;
          setElapsedTime(totalTime);
          setTotalTimeForAlphabet(totalTime);
          updateHighScores(totalTime); // Check if this score qualifies for top 3
        }

        setTypedText(inputValue);
      }
    } else {
      setStartTyping(false);
    }
  };

  const renderAlphabetTimes = () => {
    return alphabetTimes.map((time, index) => {
      const letter = String.fromCharCode(97 + index);
      const displayTime = index === 0 ? "0.00" : time.toFixed(2);

      if (startTyping && typedText.length > index) {
        return (
          <div key={index} className="text-lg sm:text-xl text-gray-800">
            <span className="font-semibold">{letter}:</span>{" "}
            <span className="text-orange-600">{displayTime}</span>
          </div>
        );
      }
      return null;
    });
  };

  const renderAlphabetWithHighlights = () => {
    const alphabet = "abcdefghijklmnopqrstuvwxyz";

    return (
      <div className="flex flex-wrap justify-center mt-4 mb-1">
        {alphabet.split("").map((letter, index) => {
          const isCompleted = index < typedText.length;
          const isNext = index === typedText.length;

          return (
            <span
              key={index}
              className={`flex items-center justify-center mr-[2px] text-[16px] sm:text-[24px] font-bold transition-all ${
                isCompleted
                  ? "text-green-500"
                  : isNext
                  ? "text-orange-600 animate-pulse"
                  : "text-gray-400"
              }`}
            >
              {letter}
            </span>
          );
        })}
      </div>
    );
  };

  const nextExpectedChar = () => {
    const alphabet = "abcdefghijklmnopqrstuvwxyz";
    return alphabet[typedText.length];
  };

  const updateHighScores = async (newTime) => {
    // Access the unified highScores state (assumes highScores holds all scores)
    const qualifiesForTop3 =
      highScores.length < 3 || newTime < highScores[2].time;

    if (qualifiesForTop3) {
      // Temporarily store the new score and open the modal
      setTempScore({ time: parseFloat(newTime), name: "" });
      setIsModalOpen(true);
      setTotalTimeForAlphabet(newTime); // Store the time temporarily

      // Don't fetch the leaderboard yet, it will be done after Instagram submission
    }
  };

  const handleInstagramSubmit = async () => {
    if (userInstagram.trim() !== "" && tempScore) {
      const newScore = { ...tempScore, name: userInstagram };

      // Add the new score to the leaderboard and sort
      const updatedScores = [...highScores, newScore]
        .sort((a, b) => a.time - b.time)
        .slice(0, 3); // Keep only top 3

      setHighScores(updatedScores); // Update the leaderboard state

      // Close the modal before sending the request to avoid issues
      setTempScore(null);
      setIsModalOpen(false);

      // Show "Submitting..." message
      setSubmitting(true);

      try {
        // Send score to the backend (No device field here)
        const response = await fetch(
          "https://a-to-z-server-oa7r.onrender.com/api/scores", // Single endpoint
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: userInstagram,
              time: tempScore.time,
              // No device field here
            }),
          }
        );

        if (response.ok) {
          // Fetch the updated leaderboard from the server
          const updatedScoresFromServer = await response.json();
          setHighScores(updatedScoresFromServer); // Update the state with all scores
        } else {
          console.error("Failed to submit score");
        }
      } catch (error) {
        console.error("Error submitting score:", error);
      } finally {
        // Hide "Submitting..." message
        setSubmitting(false);
      }
    }
  };

  const handleReset = () => {
    setTypedText("");
    setElapsedTime("0.00");
    setStartTime(null);
    setTimerRunning(false);
    setStartTyping(false);
    clearInterval(intervalId);
    setTotalTimeForAlphabet(null);
    setAlphabetTimes([]);
  };

  const handleInstagramChange = (e) => {
    let value = e.target.value;

    if (!value.startsWith("@")) {
      value = "@" + value;
    }

    value = value.replace(/@+/g, "@").replace(/\s+/g, "");

    setUserInstagram(value);
  };

  const getInstagramLink = (name) => {
    return `https://instagram.com/${name.replace("@", "")}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-orange-200 to-yellow-100 px-6 py-10 sm:px-8 sm:py-12">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 mb-6 tracking-wider text-left">
        A to Z
      </h1>
      <p className="text-lg sm:text-xl font-medium text-gray-600 mb-6 italic text-center">
        The timer starts when you do!
      </p>

      <div className="w-full max-w-2xl bg-white shadow-xl rounded-lg p-6 sm:p-8 mb-6 transform hover:scale-105 transition-transform">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 text-left">
          Start Typing:
        </h2>
        <input
          type="text"
          value={typedText}
          onChange={handleInputChange}
          placeholder="Type the alphabet..."
          className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors mb-4 text-lg sm:text-xl"
        />
        <div className="mt-4 text-center">
          <p className="text-orange-600 text-lg sm:text-xl">
            ⏱ Total Time:{" "}
            <span className="font-bold">{elapsedTime} seconds</span>
          </p>
        </div>

        {/* Render highlight below the text field */}
        {renderAlphabetWithHighlights()}

        <button
          onClick={handleReset}
          className="mt-6 px-6 py-3 bg-orange-500 text-white font-semibold rounded-full hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 w-full text-lg sm:text-xl"
        >
          Reset
        </button>
      </div>

      {/* Display Time for Each Alphabet */}
      {startTyping && (
        <div className="w-full max-w-2xl bg-white shadow-xl rounded-lg p-6 sm:p-8 mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 text-left">
            Time Per Alphabet
          </h2>
          <div>{renderAlphabetTimes()}</div>
        </div>
      )}

      {/* Leaderboard */}
      <div className="w-full max-w-2xl bg-white shadow-xl rounded-lg p-6 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 text-left">
          Leaderboard
        </h2>

        <div className="mb-6">
          {loading ? (
            <p className="text-gray-500 text-center">Loading leaderboard...</p>
          ) : highScores.length > 0 ? (
            <ol className="list-decimal list-inside text-gray-700 space-y-2">
              {highScores.map((entry, index) => (
                <li key={index}>
                  <a
                    href={getInstagramLink(entry.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-orange-600"
                  >
                    {entry.name}
                  </a>
                  -
                  <span className="text-gray-600">
                    {entry.time.toFixed(2)} seconds{" "}
                    {/* Displaying 2 decimals */}
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-gray-500 text-center">No high scores yet!</p>
          )}
        </div>
      </div>

      {/* Modal for Instagram Username */}
      {isModalOpen && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 flex justify-center items-center z-10">
          <div className="bg-white p-6 rounded-lg shadow-xl w-80 sm:w-96">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 text-center">
              Congrats on your new top score!
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 mb-4 text-center">
              Please enter your Instagram username:
            </p>
            <input
              type="text"
              value={userInstagram}
              onChange={handleInstagramChange}
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 text-lg sm:text-xl"
              placeholder="e.g. @yourusername"
              disabled={submitting} // Disable input while submitting
            />
            <button
              onClick={handleInstagramSubmit}
              className={`px-6 py-3 text-white font-semibold rounded-full w-full text-lg sm:text-xl ${
                submitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-orange-500 hover:bg-orange-600"
              }`}
              disabled={submitting} // Disable button while submitting
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpeedyAlphabet;
