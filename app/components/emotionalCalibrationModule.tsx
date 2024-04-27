import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'

import EmotionalCalibrationBlock from './emotionalCalibrationBlock';

export default function EmotionalCalibrationModule() {
  return (
    <Card className="w-[750px] h-[500px]">
        <CardHeader>
            <CardTitle>Emotional Calibration</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4">
            <EmotionalCalibrationBlock emotion="Flow" />
            <EmotionalCalibrationBlock emotion="Flourishing" />
        </CardContent>
    </Card>
  );
}