import EmotionalCalibrationModule from "./components/emotionalCalibrationModule";

export default function Dashboard() {
  return (
    <main className="m-2">
      <h1 className="text-3xl text-center my-4">Personal Dashboard</h1>
      <div className="flex justify-center">
        <EmotionalCalibrationModule />
      </div>
    </main>
  );
}
