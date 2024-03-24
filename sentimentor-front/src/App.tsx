import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { v4 as uuidv4 } from "uuid";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import RoomPage from "./components/RoomPage";

import "./App.css";
import axios from "axios";

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

const setUserInRoom = async (roomId: string, userId: string) => {
  await axios.post("https://sentiserver.vercel.app/api/addUser/", {
    roomId,
    userId,
  });
};

const App: React.FC<{ userId: string }> = ({ userId }) => {
  const navigate = useNavigate();
  const [joinRoomId, setJoinRoomId] = useState("");
  const [roomName, setRoomName] = useState("");
  const [joinError, setJoinError] = useState<string | null>(null);

  const handleCreateRoom = async () => {
    const response = await axios.post(
      "https://sentiserver.vercel.app/api/createRoom/",
      {
        roomName,
      }
    );

    const roomId = response.data.roomId;

    setUserInRoom(roomId, userId);
    navigate(`/room/${roomId}`, {
      state: { roomName, roomId, isProfessor: true },
    });
  };

  const handleJoinRoom = async () => {
    try {
      const response = await axios.get(
        "https://sentiserver.vercel.app/api/getRooms/"
      );
      const existingRooms = response.data.rooms;

      const roomExists = existingRooms.some(
        (room: Room) => room.id === Number(joinRoomId)
      );

      if (roomExists) {
        setUserInRoom(joinRoomId, userId);
        navigate(`/room/${joinRoomId}`, {
          state: { roomId: joinRoomId, isProfessor: false },
        });
        setJoinError(null);
      } else {
        setJoinError("Room does not exist");
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
      setJoinError("Error fetching rooms");
    }
  };

  return (
    <div className="app">
      <Tabs defaultValue="join" className="w-[400px]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="join">Join</TabsTrigger>
          <TabsTrigger value="create">Create</TabsTrigger>
        </TabsList>
        <TabsContent value="join">
          <Card>
            <CardHeader>
              <CardTitle>Join</CardTitle>
              <CardDescription>
                Enter the 6-digit code to join the room:
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="name">Code</Label>
                <InputOTP
                  maxLength={6}
                  onComplete={(value) => setJoinRoomId(value)}
                >
                  <InputOTPGroup>
                    <InputOTPSlot
                      index={0}
                      onChange={(value) =>
                        setJoinRoomId(
                          (prevId) =>
                            prevId.slice(0, 0) + value + prevId.slice(1)
                        )
                      }
                    />
                    <InputOTPSlot
                      index={1}
                      onChange={(value) =>
                        setJoinRoomId(
                          (prevId) =>
                            prevId.slice(0, 1) + value + prevId.slice(2)
                        )
                      }
                    />
                    <InputOTPSlot
                      index={2}
                      onChange={(value) =>
                        setJoinRoomId(
                          (prevId) =>
                            prevId.slice(0, 2) + value + prevId.slice(3)
                        )
                      }
                    />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot
                      index={3}
                      onChange={(value) =>
                        setJoinRoomId(
                          (prevId) =>
                            prevId.slice(0, 3) + value + prevId.slice(4)
                        )
                      }
                    />
                    <InputOTPSlot
                      index={4}
                      onChange={(value) =>
                        setJoinRoomId(
                          (prevId) =>
                            prevId.slice(0, 4) + value + prevId.slice(5)
                        )
                      }
                    />
                    <InputOTPSlot
                      index={5}
                      onChange={(value) =>
                        setJoinRoomId((prevId) => prevId.slice(0, 5) + value)
                      }
                    />
                  </InputOTPGroup>
                </InputOTP>
                {joinError && <p className="text-red-500">{joinError}</p>}
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleJoinRoom}>Join Room</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Create</CardTitle>
              <CardDescription>Enter a name for your room:</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="name">Class Name</Label>
                <Input
                  type="text"
                  placeholder="..."
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleCreateRoom}>Create Room</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const AppWithRouter: React.FC = () => {
  const userId: string = uuidv4();
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App userId={userId} />} />
        <Route path="/room/:id" element={<RoomPage userId={userId} />} />
      </Routes>
    </Router>
  );
};

export default AppWithRouter;
