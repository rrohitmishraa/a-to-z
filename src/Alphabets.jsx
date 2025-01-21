import React, { useState, useEffect } from "react";

const SpeedyAlphabet = () => {
  const [typedText, setTypedText] = useState("");
  const [startTyping, setStartTyping] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState("0.00");
  const [timerRunning, setTimerRunning] = useState(false);
  const [intervalId, setIntervalId] = useState(null);
  const [alphabetTimes, setAlphabetTimes] = useState([]); // Store time for each letter
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
        setElapsedTime(((Date.now() - now) / 1000).toFixed(2)); // Round to 2 decimal places
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

    // Check if inputValue is not empty before accessing the last character
    if (inputValue.length > 0) {
      const currentChar = inputValue[inputValue.length - 1].toLowerCase();

      // Start typing flag is set to true once the user types anything
      if (!startTyping && inputValue.length > 0) {
        setStartTyping(true); // User has started typing
      }

      // For the first letter, set the timer to 0.00 but show "-" instead
      if (typedText.length === 0) {
        setElapsedTime("0.00"); // Set timer to 0.00 for the first letter
      }

      if (currentChar === nextExpectedChar()) {
        if (!timerRunning) startTimer(); // Start the timer on the first correct key

        const currentTime = (Date.now() - startTime) / 1000; // Calculate time for the current character

        // Store the time for each alphabet
        setAlphabetTimes((prevTimes) => [...prevTimes, currentTime]);

        if (inputValue === "abcdefghijklmnopqrstuvwxyz") {
          stopTimer(); // Stop the timer when the alphabet is complete
          const totalTime = elapsedTime;
          setElapsedTime(totalTime);
          setTotalTimeForAlphabet(totalTime);
          setIsModalOpen(true);
        }

        setTypedText(inputValue); // Update typed text
      }
    } else {
      // Handle the case when the input is cleared or backspace is pressed
      setStartTyping(false); // Optionally reset the start typing flag when cleared
    }
  };

  const renderAlphabetTimes = () => {
    return alphabetTimes.map((time, index) => {
      const letter = String.fromCharCode(97 + index); // Get the corresponding letter (a, b, c, etc.)
      const displayTime = index === 0 ? "0.00" : time.toFixed(2); // Show "-" for the first letter

      // Render only if the user has typed at least up to the current letter
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
    setElapsedTime("0.00");
    setStartTime(null);
    setTimerRunning(false);
    clearInterval(intervalId);
    setTotalTimeForAlphabet(null);
    setAlphabetTimes([]); // Reset alphabet timings
  };

  const handleInstagramChange = (e) => {
    let value = e.target.value;

    // Automatically add '@' at the start if it's not there.
    if (!value.startsWith("@")) {
      value = "@" + value;
    }

    // Remove any extra '@' symbols and spaces.
    value = value.replace(/@+/g, "@").replace(/\s+/g, "");

    setUserInstagram(value);
  };

  const getInstagramLink = () => {
    return `https://instagram.com/${userInstagram.replace("@", "")}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-orange-200 to-yellow-100 px-6 py-10 sm:px-8 sm:py-12">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 mb-6 tracking-wider text-left">
        A to Z
      </h1>
      <p className="text-lg sm:text-xl font-medium text-gray-600 mb-6 italic text-center">
        The timer starts when you do!
      </p>

      {/* Typing Area */}
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
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 text-left">
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

        <div className="mb-6">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 text-left">
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-8 max-w-lg w-full">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Leaderboard
            </h2>
            <p className="text-lg mb-6">
              Enter your Instagram handle to be included in the leaderboard!
            </p>
            <input
              type="text"
              value={userInstagram}
              onChange={handleInstagramChange}
              placeholder="Instagram handle (e.g., @username)"
              className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 mb-4 text-lg"
            />
            <div className="flex justify-end">
              <button
                onClick={handleInstagramSubmit}
                className="bg-orange-500 text-white px-6 py-2 rounded-full hover:bg-orange-600 focus:outline-none"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpeedyAlphabet;
