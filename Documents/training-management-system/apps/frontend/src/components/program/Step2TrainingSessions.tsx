import { useState } from 'react';

interface Block {
  id: string;
  name: string;
  numberOfSessions: number;
  duration: number;
}

interface FormData {
  useBlocks: boolean;
  numberOfSessions: number;
  programDuration: number;
  blocks: Block[];
}

interface Step2Props {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step2TrainingSessions({ formData, updateFormData, onNext, onBack }: Step2Props) {
  const [numberOfBlocks, setNumberOfBlocks] = useState(formData.blocks.length || 2);

  const handleToggleBlocks = (useBlocks: boolean) => {
    updateFormData({ useBlocks });
    if (useBlocks && formData.blocks.length === 0) {
      // Initialize with 2 blocks by default
      const initialBlocks: Block[] = [
        { id: 'block-1', name: 'Block 1', numberOfSessions: 1, duration: 1 },
        { id: 'block-2', name: 'Block 2', numberOfSessions: 1, duration: 1 },
      ];
      updateFormData({ blocks: initialBlocks });
      setNumberOfBlocks(2);
    }
  };

  const handleNumberOfBlocksChange = (num: number) => {
    setNumberOfBlocks(num);
    const currentBlocks = formData.blocks;
    
    if (num > currentBlocks.length) {
      // Add new blocks
      const newBlocks = [...currentBlocks];
      for (let i = currentBlocks.length; i < num; i++) {
        newBlocks.push({
          id: `block-${i + 1}`,
          name: `Block ${i + 1}`,
          numberOfSessions: 1,
          duration: 1,
        });
      }
      updateFormData({ blocks: newBlocks });
    } else if (num < currentBlocks.length) {
      // Remove blocks
      updateFormData({ blocks: currentBlocks.slice(0, num) });
    }
  };

  const handleUpdateBlock = (index: number, updates: Partial<Block>) => {
    const updatedBlocks = formData.blocks.map((block, i) =>
      i === index ? { ...block, ...updates } : block
    );
    updateFormData({ blocks: updatedBlocks });
  };

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Training Sessions</h1>
        <p className="text-gray-600 mt-1">
          Configure the structure and organization of your training sessions.
        </p>
      </div>

      {/* Toggle: Use Training Blocks */}
      <div className="mb-8">
        <label className="flex items-center gap-3 cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              checked={formData.useBlocks}
              onChange={(e) => handleToggleBlocks(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-teal-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
          </div>
          <div>
            <div className="font-medium text-gray-900">Use Training Blocks</div>
            <div className="text-sm text-gray-600">Organize sessions into logical blocks or modules</div>
          </div>
        </label>
      </div>

      {/* Simple Program Configuration */}
      {!formData.useBlocks && (
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Sessions
            </label>
            <input
              type="number"
              min="1"
              value={formData.numberOfSessions}
              onChange={(e) => updateFormData({ numberOfSessions: parseInt(e.target.value) || 1 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Program Duration (weeks)
            </label>
            <input
              type="number"
              min="1"
              value={formData.programDuration}
              onChange={(e) => updateFormData({ programDuration: parseInt(e.target.value) || 1 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Training Blocks Configuration */}
      {formData.useBlocks && (
        <div className="space-y-6">
          {/* Number of Blocks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Blocks
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={numberOfBlocks}
              onChange={(e) => handleNumberOfBlocksChange(parseInt(e.target.value) || 1)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          {/* Block Configuration */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Block Configuration</h3>
            <div className="grid grid-cols-2 gap-6">
              {formData.blocks.map((block, index) => (
                <div key={block.id} className="p-6 bg-white border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-4">{block.name}</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Sessions
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={block.numberOfSessions}
                        onChange={(e) => handleUpdateBlock(index, { numberOfSessions: parseInt(e.target.value) || 1 })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Duration (weeks)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={block.duration}
                        onChange={(e) => handleUpdateBlock(index, { duration: parseInt(e.target.value) || 1 })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}