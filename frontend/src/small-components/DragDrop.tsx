import { CloudDownload, Loader2 } from "lucide-react";
import Image from "next/image";
import React from "react";
import Dropzone, { FileRejection } from "react-dropzone";
import { toast } from "sonner";

interface DragDropProps {
  onDropAccepted: (acceptedFile: File[]) => void;
  imagePrev: string;
  side: string;
  user: any;
  isLoading: boolean;
  onOpenAuthModal: () => void;
}

function DragDrop({
  onDropAccepted,
  imagePrev,
  side,
  user,
  isLoading,
  onOpenAuthModal,
}: DragDropProps) {
  function onDropRejected(fileRejection: FileRejection[]) {
    const fileReject = fileRejection[0];

    toast.error(
      `${fileReject.file.type} is not supported. Please choose a PNG, JPG/JPEG image type instead.`,
      {
        style: {
          backgroundColor: "red",
          color: "white",
          border: "none",
          fontSize: 14,
        },
      }
    );
  }

  return (
    <div className="w-full h-full p-1 rounded-md relative  bg-[#DEE0DF]">
      {isLoading && (
        <div className="absolute inset-0 z-10 bg-black/40 flex items-center justify-center">
          <Loader2 className="animate-spin text-white w-8 h-8" />
        </div>
      )}
      {imagePrev ? (
        <div className="w-full h-full rounded-md absolute top-0 left-0">
          <Image
            src={imagePrev}
            className="w-full h-full rounded-md object-cover"
            alt="Uploaded preview"
            width={500}
            height={500}
          />
        </div>
      ) : (
        <Dropzone
          onDropAccepted={(files) => {
            if (!user) {
              onOpenAuthModal();
              return;
            }
            onDropAccepted(files);
          }}
          maxSize={5 * 1024 * 1024}
          accept={{
            "image/png": [".png"],
            "image/jpg": [".jpg"],
            "image/jpeg": [".jpeg"],
          }}
          onDropRejected={onDropRejected}
        >
          {({ getRootProps, getInputProps }) => (
            <div
              className="w-full h-full bg-[#DEE0DF] rounded-md cursor-pointer"
              {...getRootProps()} // This is where the dropzone functionality is tied to the div
            >
              <input {...getInputProps()} />

              <div className="w-full h-full flex flex-col gap-2 items-center justify-center">
                <p>{side}</p>
                <CloudDownload className="text-[#1a1a1a]/50" />
              </div>
            </div>
          )}
        </Dropzone>
      )}
    </div>
  );
}

export default DragDrop;
