import { useRef } from "react";

interface ProfileboxProps {
  profilePicture?: string;
  onImageChange: (file: File) => void;
}

const Profilebox: React.FC<ProfileboxProps> = ({
  profilePicture,
  onImageChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageChange(e.target.files[0]);
    }
  };

  return (
    <div className="relative flex items-center">
      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-2 border-green-500">
        {profilePicture ? (
          <img
            src={profilePicture}
            alt="Profile"
            className="w-full h-full object-cover"
            crossOrigin="use-credentials"
          />
        ) : (
          <span className="text-gray-400 text-xs">Pic</span>
        )}
      </div>

      <button
        type="button"
        className="absolute bottom-0 right-0 bg-green-600 hover:bg-green-700 text-white rounded-full p-1 border-2 border-white shadow"
        style={{ transform: "translate(25%, 25%)" }}
        aria-label="Add profile picture"
        onClick={() => fileInputRef.current?.click()}
      >
        <svg width="16" height="16" fill="none" viewBox="0 0 20 20">
          <path
            d="M10 5v10M5 10h10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <input
        type="file"
        name="image"
        accept="image/jpeg,image/png,image/jpg"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
    </div>
  );
};

export default Profilebox;
