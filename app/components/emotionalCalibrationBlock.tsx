import { Input } from '@/components/ui/input'

export default function EmotionalCalibrationBlock({ emotion }: { emotion: string }) {
    return (
        <section>
            <h2 className="text-xl mb-2">{emotion}</h2>
            <Input />
        </section>
    )
}