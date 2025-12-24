/**
 * YouTubeWorkflow Component - P02: YouTube Integration Workflow
 *
 * Stepper component showing 4-step workflow:
 * 1. URL Input
 * 2. Download Subtitles
 * 3. Process + Import
 * 4. Style Conversion
 */

interface YouTubeWorkflowProps {
  currentStep: number;
}

export function YouTubeWorkflow({ currentStep }: YouTubeWorkflowProps) {
  const steps = [
    { number: 1, label: 'URL' },
    { number: 2, label: 'Download' },
    { number: 3, label: 'Import' },
    { number: 4, label: 'Convert' },
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            {/* Step circle */}
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                currentStep >= step.number
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {step.number}
            </div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-1 mx-2 transition-colors ${
                  currentStep > step.number ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step labels */}
      <div className="flex justify-between mt-2 text-sm text-gray-600">
        {steps.map((step) => (
          <span
            key={step.number}
            className={`flex-1 text-center ${
              currentStep >= step.number ? 'font-medium text-blue-600' : ''
            }`}
            style={{ marginLeft: step.number > 1 ? '-16px' : '0' }}
          >
            {step.label}
          </span>
        ))}
      </div>
    </div>
  );
}
