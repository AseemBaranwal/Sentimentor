import React, { useEffect, useRef } from "react";

interface Participant {
  id: string;
  stream: MediaStream | null;
}

interface ParticipantCameraProps {
  participant: Participant;
}

const ParticipantCamera: React.FC<ParticipantCameraProps> = ({
  participant,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (participant.stream && videoRef.current) {
      if (participant.stream instanceof MediaStream) {
        videoRef.current.srcObject = participant.stream;
      } else {
        console.error("Invalid stream object:", participant.stream);
      }
    }
  }, [participant.stream]);

  return (
    <div>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />
    </div>
  );
};

export default ParticipantCamera;
