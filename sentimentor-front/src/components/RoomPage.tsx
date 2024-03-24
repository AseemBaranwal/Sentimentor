import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import { Chart } from "react-google-charts";
import axios from "axios";
import html2canvas from "html2canvas";

interface Room {
  id: number;
  name: string;
  users: Array<{
    id: string;
    sentiment: string;
  }>;
  _id: string;
  __v: number;
}

interface SentimentData
  extends Array<
    (
      | number
      | string
      | { type: string; label?: string; id?: string; role?: string }
    )[]
  > {}

const options = {
  title: "Adjusted Sentiment Over Time",
  curveType: "function",
  series: [{ color: "#E7711B" }],
  intervals: { style: "points", pointSize: 4 },
  legend: "none",
  hAxis: {
    title: "Time",
  },
  vAxis: {
    title: "Sentiment (adjusted by confidence)",
    viewWindow: { min: 0, max: 1 },
  },
};

const sendSentiment = async (userId: string, sentiment: number) => {
  try {
    await axios.post("https://sentiserver.vercel.app/api/setSentiment/", {
      userId,
      sentiment,
    });
  } catch (error) {
    console.error("Error sending sentiment:", error);
  }
};

const getRoomData = async (roomId: string) => {
  try {
    const response = await axios.get(
      `https://sentiserver.vercel.app/api/getRooms/${roomId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching room data:", error);
  }
};

const RoomPage: React.FC<{ userId: string }> = ({ userId }) => {
  const location = useLocation();
  const roomId = location.state?.roomId || "";
  const isProf = location.state?.isProfessor || false;
  const [roomData, setRoomData] = useState<Room | null>(null);
  const [graphData, setGraphData] = useState<SentimentData>([
    [
      { type: "string", label: "time" },
      { type: "number", label: "values" },
    ],
    ["yo", 0],
    ["yo", 0],
    ["yo", 0],
    ["yo", 0],
    ["yo", 0],
    ["yo", 0],
    ["yo", 0],
    ["yo", 0],
    ["yo", 0],
    ["yo", 0],
  ]);

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [selectedSentiment, setSelectedSentiment] = useState<number | null>(
    null
  );
  const localVideoRef = useRef<HTMLVideoElement>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoomData = async () => {
      const data = await getRoomData(roomId);
      setRoomData(data);
    };

    fetchRoomData();
  }, [roomId]);

  useEffect(() => {
    const startLocalStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setLocalStream(stream);
      } catch (error) {
        console.error("Error accessing local stream:", error);
      }
    };

    startLocalStream();

    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (!isProf) return;
    const fetchData = async () => {
      console.log("IM A PROF");
      try {
        const response = await axios.get(
          `https://sentiserver.vercel.app/api/getSentimentData`
        );
        setGraphData(response.data);
      } catch (error) {
        console.error("Error fetching sentiment data:", error);
      }
    };

    const intervalId = setInterval(fetchData, 5001);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (isProf) return;
    const fetchData = async () => {
      console.log("IM A STUD");
      try {
        if (!localVideoRef.current) {
          console.log("wtaf");
          return;
        }

        const canvas = await html2canvas(localVideoRef.current, {
          useCORS: true,
          scale: 0.1, // Adjust this value as needed
        });

        const base64Image = canvas.toDataURL("image/png");
        console.log("base64Image", base64Image);

        // const response = await axios.post(
        //   "http://localhost:5001/api/sentiment",
        //   { imageString: base64Image }
        // );
        // console.log("response", response.data);

        const response = await fetch("http://localhost:5001/api/sentiment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ imageString: base64Image }),
        });

        // const queryParams = new URLSearchParams({ imageString: base64Image }).toString();
        // const url = `http://localhost:5001/api/sentiment?${queryParams}`;
        // const response = await fetch(url, { method: "POST" });

        const something = await response.json();
        console.log("response", something);
      } catch (error) {
        console.error("Error sending camera image:", error);
      }
    };

    const intervalId = setInterval(fetchData, 5001);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const sentimentColors = [
    "#E53E3E",
    "#DD6B20",
    "#D69E2E",
    "#38A169",
    "#319795",
  ];

  const handleSentimentClick = (userId: string, index: number) => {
    setSelectedSentiment(index);
    sendSentiment(userId, index);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white shadow">
        <h1 className="text-xl font-semibold text-gray-800">
          Room: {roomData?.name || "Loading..."}
        </h1>
        <h1 className="text-xl font-semibold text-gray-800">
          Join Code: {roomId}
        </h1>
        <Button onClick={() => navigate("/")}>Leave Room</Button>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-grow items-center justify-center p-6">
        {/* Local Camera */}
        {!isProf && (
          <div className="w-full max-w-4xl rounded-lg overflow-hidden shadow-lg mb-8">
            {localStream && (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-auto"
              />
            )}
          </div>
        )}

        {/* Sentiment Buttons OR Data View */}
        {!isProf ? (
          <div className="flex space-x-4">
            {sentimentColors.map((color, index) => (
              <button
                key={index}
                className="w-12 h-12 rounded-full focus:outline-none transition-colors duration-300 ease-in-out transform hover:scale-110 relative"
                style={{
                  backgroundColor: color,
                  filter:
                    selectedSentiment === index ? "grayscale(50%)" : "none",
                }}
                onClick={() => handleSentimentClick(userId, index)}
              >
                {selectedSentiment === index && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m4.5 12.75 6 6 9-13.5"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex justify-center w-full max-w-4xl">
            <Chart
              className={"flex align-center justify-center"}
              width={"100%"}
              height={"400px"}
              chartType="LineChart"
              loader={<div>Loading Chart</div>}
              data={graphData}
              options={options}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomPage;
