import React, { useState, useEffect } from "react";

const SpeedyAlphabet = () => {
  const [typedText, setTypedText] = useState("");
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState("0.000");
  const [timerRunning, setTimerRunning] = useState(false);
  const [intervalId, setIntervalId] = useState(null);
  const [highScoresPhone, setHighScoresPhone] = useState([
    { name: "Alice", time: 10.5 },
    { name: "Bob", time: 12.3 },
    { name: "Charlie", time: 15.2 },
  ]);
  const [highScoresComputer, setHighScoresComputer] = useState([
    { name: "John", time: 9.5 },
    { name: "Doe", time: 11.1 },
    { name: "Jane", time: 13.0 },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userInstagram, setUserInstagram] = useState("");
  const [totalTimeForAlphabet, setTotalTimeForAlphabet] = useState(null);
  const [isPhone, setIsPhone] = useState(false);

  // Detect if the user is on a phone or computer
  useEffect(() => {
    const isMobile = window.innerWidth <= 768;
    setIsPhone(isMobile);
  }, []);

  const startTimer = () => {
    if (!timerRunning) {
      const now = Date.now();
      setStartTime(now);
      setTimerRunning(true);
      const id = setInterval(() => {
        setElapsedTime(((Date.now() - now) / 1000).toFixed(3));
      }, 1);
      setIntervalId(id);
    }
  };

  const stopTimer = () => {
    clearInterval(intervalId);
    setTimerRunning(false);
  };

  const handleInputChange = (e) => {
    const currentChar = e.target.value[e.target.value.length - 1].toLowerCase(); // Get the last character entered
    if (currentChar === nextExpectedChar()) {
      if (!timerRunning) startTimer(); // Start the timer on the first correct key
      if (e.target.value === "abcdefghijklmnopqrstuvwxyz") {
        stopTimer(); // Stop the timer when the alphabet is complete
        const totalTime = elapsedTime;
        setElapsedTime(totalTime);
        setTotalTimeForAlphabet(totalTime);
        setIsModalOpen(true);
      }
      setTypedText(e.target.value); // Update typed text
    }
  };

  const nextExpectedChar = () => {
    const alphabet = "abcdefghijklmnopqrstuvwxyz";
    return alphabet[typedText.length];
  };

  const updateHighScores = (newTime) => {
    const updatedScores = [
      ...(isPhone ? highScoresPhone : highScoresComputer),
      { name: userInstagram, time: parseFloat(newTime) },
    ]
      .sort((a, b) => a.time - b.time)
      .slice(0, 5); // Keep top 5 scores

    if (isPhone) {
      setHighScoresPhone(updatedScores);
    } else {
      setHighScoresComputer(updatedScores);
    }
  };

  const handleInstagramSubmit = () => {
    if (userInstagram.trim() !== "") {
      updateHighScores(totalTimeForAlphabet);
      setIsModalOpen(false);
    }
  };

  const handleReset = () => {
    setTypedText("");
    setElapsedTime("0.000");
    setStartTime(null);
    setTimerRunning(false);
    clearInterval(intervalId);
    setTotalTimeForAlphabet(null);
  };

  // Ensure the @ sign is prepended and not removable
  const handleInstagramChange = (e) => {
    let value = e.target.value;
    if (!value.startsWith("@")) {
      value = "@" + value;
    }
    setUserInstagram(value);
  };

  const getInstagramLink = () => {
    return `https://instagram.com/${userInstagram.replace("@", "")}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-orange-200 to-yellow-100 px-6 py-10 sm:px-8 sm:py-12">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 mb-6 tracking-wider text-center">
        A to Z
      </h1>
      <p className="text-lg sm:text-xl font-medium text-gray-600 mb-6 italic text-center">
        The timer starts when you do!
      </p>

      {/* Typing Area */}
      <div className="w-full max-w-2xl bg-white shadow-xl rounded-lg p-6 sm:p-8 mb-6 transform hover:scale-105 transition-transform">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">
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
        <button
          onClick={handleReset}
          className="mt-6 px-6 py-3 bg-orange-500 text-white font-semibold rounded-full hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 w-full text-lg sm:text-xl"
        >
          Reset
        </button>
      </div>

      {/* Leaderboard */}
      <div className="w-full max-w-2xl bg-white shadow-xl rounded-lg p-6 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 text-center">
          Leaderboard
        </h2>

        <div className="mb-6">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 text-center">
            Phone Leaderboard
          </h3>
          {highScoresPhone.length > 0 ? (
            <ol className="list-decimal list-inside text-gray-700 space-y-2">
              {highScoresPhone.map((entry, index) => (
                <li key={index}>
                  <a
                    href={getInstagramLink(entry.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-orange-600"
                  >
                    {entry.name}
                  </a>{" "}
                  -{" "}
                  <span className="text-gray-600">
                    {entry.time.toFixed(3)} seconds
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-gray-500 text-center">No high scores yet!</p>
          )}
        </div>

        <div className="mb-6">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 text-center">
            Computer Leaderboard
          </h3>
          {highScoresComputer.length > 0 ? (
            <ol className="list-decimal list-inside text-gray-700 space-y-2">
              {highScoresComputer.map((entry, index) => (
                <li key={index}>
                  <a
                    href={getInstagramLink(entry.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-orange-600"
                  >
                    {entry.name}
                  </a>{" "}
                  -{" "}
                  <span className="text-gray-600">
                    {entry.time.toFixed(3)} seconds
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-gray-500 text-center">No high scores yet!</p>
          )}
        </div>
      </div>

      {/* Modal - Instagram Handle Submission */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-3/4 sm:w-1/3">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Enter Your Instagram Username
            </h3>
            <input
              type="text"
              value={userInstagram}
              onChange={handleInstagramChange}
              placeholder="Instagram Username"
              className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 mb-4 text-lg sm:text-xl"
            />
            <button
              onClick={handleInstagramSubmit}
              className="w-full py-3 bg-orange-500 text-white font-semibold rounded-full hover:bg-orange-600"
            >
              Submit
            </button>
            <button
              onClick={() => setIsModalOpen(false)}
              className="mt-3 w-full py-3 bg-gray-300 text-black font-semibold rounded-full hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpeedyAlphabet;
