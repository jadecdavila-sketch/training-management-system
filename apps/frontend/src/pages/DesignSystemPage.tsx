import { useState } from 'react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { AddParticipantModal } from '@/components/admin/AddParticipantModal';
import { designTokens } from '@/styles/tokens';

export const DesignSystemPage = () => {
  const [inputValue, setInputValue] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: '#FDF9F3' }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-secondary-900 mb-2">Design System</h1>
          <p className="text-secondary-600">Visual component library and design tokens</p>
        </div>

        {/* Colors */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-secondary-900 mb-6">Colors</h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-secondary-700 mb-4">Primary (Warm Orange)</h3>
              <div className="grid grid-cols-10 gap-2">
                {Object.entries(designTokens.colors.primary).map(([shade, color]) => (
                  <div key={shade} className="space-y-1">
                    <div 
                      className="h-20 rounded-lg shadow-sm border border-secondary-200"
                      style={{ backgroundColor: color }}
                    />
                    <p className="text-xs text-secondary-600 text-center">{shade}</p>
                    <p className="text-xs text-secondary-500 text-center font-mono">{color}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-secondary-700 mb-4">Secondary (Neutrals)</h3>
              <div className="grid grid-cols-10 gap-2">
                {Object.entries(designTokens.colors.secondary).map(([shade, color]) => (
                  <div key={shade} className="space-y-1">
                    <div 
                      className="h-20 rounded-lg shadow-sm border border-secondary-200"
                      style={{ backgroundColor: color }}
                    />
                    <p className="text-xs text-secondary-600 text-center">{shade}</p>
                    <p className="text-xs text-secondary-500 text-center font-mono">{color}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-secondary-700 mb-4">Success</h3>
                <div className="space-y-2">
                  {Object.entries(designTokens.colors.success).map(([shade, color]) => (
                    <div key={shade} className="flex items-center gap-3">
                      <div 
                        className="w-16 h-16 rounded-lg shadow-sm border border-secondary-200"
                        style={{ backgroundColor: color }}
                      />
                      <div>
                        <p className="text-sm font-medium text-secondary-700">{shade}</p>
                        <p className="text-xs text-secondary-500 font-mono">{color}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-secondary-700 mb-4">Warning</h3>
                <div className="space-y-2">
                  {Object.entries(designTokens.colors.warning).map(([shade, color]) => (
                    <div key={shade} className="flex items-center gap-3">
                      <div 
                        className="w-16 h-16 rounded-lg shadow-sm border border-secondary-200"
                        style={{ backgroundColor: color }}
                      />
                      <div>
                        <p className="text-sm font-medium text-secondary-700">{shade}</p>
                        <p className="text-xs text-secondary-500 font-mono">{color}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-secondary-700 mb-4">Error</h3>
                <div className="space-y-2">
                  {Object.entries(designTokens.colors.error).map(([shade, color]) => (
                    <div key={shade} className="flex items-center gap-3">
                      <div 
                        className="w-16 h-16 rounded-lg shadow-sm border border-secondary-200"
                        style={{ backgroundColor: color }}
                      />
                      <div>
                        <p className="text-sm font-medium text-secondary-700">{shade}</p>
                        <p className="text-xs text-secondary-500 font-mono">{color}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-secondary-700 mb-4">Info</h3>
                <div className="space-y-2">
                  {Object.entries(designTokens.colors.info).map(([shade, color]) => (
                    <div key={shade} className="flex items-center gap-3">
                      <div 
                        className="w-16 h-16 rounded-lg shadow-sm border border-secondary-200"
                        style={{ backgroundColor: color }}
                      />
                      <div>
                        <p className="text-sm font-medium text-secondary-700">{shade}</p>
                        <p className="text-xs text-secondary-500 font-mono">{color}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Typography */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-secondary-900 mb-6">Typography</h2>
          
          <div className="bg-white rounded-lg p-8 shadow-sm">
            <div className="space-y-6">
              <div>
                <p className="text-sm text-secondary-500 mb-2">Font Family: Montserrat</p>
                <p className="text-4xl font-bold">The quick brown fox jumps over the lazy dog</p>
              </div>

              <div className="border-t border-secondary-200 pt-6 space-y-4">
                <div>
                  <p className="text-xs text-secondary-500 mb-1">4xl / 2.25rem / Bold</p>
                  <p className="text-4xl font-bold text-secondary-900">Heading 1</p>
                </div>
                <div>
                  <p className="text-xs text-secondary-500 mb-1">3xl / 1.875rem / Bold</p>
                  <p className="text-3xl font-bold text-secondary-900">Heading 2</p>
                </div>
                <div>
                  <p className="text-xs text-secondary-500 mb-1">2xl / 1.5rem / Semibold</p>
                  <p className="text-2xl font-semibold text-secondary-900">Heading 3</p>
                </div>
                <div>
                  <p className="text-xs text-secondary-500 mb-1">xl / 1.25rem / Semibold</p>
                  <p className="text-xl font-semibold text-secondary-900">Heading 4</p>
                </div>
                <div>
                  <p className="text-xs text-secondary-500 mb-1">lg / 1.125rem / Medium</p>
                  <p className="text-lg font-medium text-secondary-900">Large Text</p>
                </div>
                <div>
                  <p className="text-xs text-secondary-500 mb-1">base / 1rem / Normal</p>
                  <p className="text-base text-secondary-900">Body text with regular weight for comfortable reading</p>
                </div>
                <div>
                  <p className="text-xs text-secondary-500 mb-1">sm / 0.875rem / Normal</p>
                  <p className="text-sm text-secondary-700">Small text for secondary information</p>
                </div>
                <div>
                  <p className="text-xs text-secondary-500 mb-1">xs / 0.75rem / Normal</p>
                  <p className="text-xs text-secondary-600">Extra small text for labels and captions</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Buttons */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-secondary-900 mb-6">Buttons</h2>
          
          <div className="bg-white rounded-lg p-8 shadow-sm space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-secondary-700 mb-4">Variants</h3>
              <div className="flex flex-wrap gap-4">
                <Button variant="primary">Primary Button</Button>
                <Button variant="secondary">Secondary Button</Button>
                <Button variant="ghost">Ghost Button</Button>
                <Button variant="destructive">Destructive Button</Button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-secondary-700 mb-4">Sizes</h3>
              <div className="flex flex-wrap items-center gap-4">
                <Button variant="primary" size="sm">Small</Button>
                <Button variant="primary" size="md">Medium</Button>
                <Button variant="primary" size="lg">Large</Button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-secondary-700 mb-4">States</h3>
              <div className="flex flex-wrap gap-4">
                <Button variant="primary">Default</Button>
                <Button variant="primary" disabled>Disabled</Button>
                <Button variant="primary" loading>Loading</Button>
              </div>
            </div>
          </div>
        </section>

        {/* Inputs */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-secondary-900 mb-6">Inputs</h2>
          
          <div className="bg-white rounded-lg p-8 shadow-sm">
            <div className="max-w-md space-y-6">
              <Input 
                label="Default Input"
                placeholder="Enter text..."
              />
              
              <Input 
                label="Input with Helper Text"
                placeholder="user@example.com"
                helperText="We'll never share your email"
              />
              
              <Input 
                label="Input with Error"
                placeholder="Enter value..."
                error="This field is required"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />

              <Input 
                label="Disabled Input"
                placeholder="Cannot edit"
                disabled
              />
            </div>
          </div>
        </section>

        {/* Spacing */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-secondary-900 mb-6">Spacing Scale</h2>
          
          <div className="bg-white rounded-lg p-8 shadow-sm">
            <div className="space-y-4">
              {Object.entries(designTokens.spacing).map(([key, value]) => (
                <div key={key} className="flex items-center gap-4">
                  <div className="w-20 text-sm font-mono text-secondary-600">{key}</div>
                  <div className="w-24 text-sm text-secondary-500">{value}</div>
                  <div 
                    className="h-8 bg-primary-500 rounded"
                    style={{ width: value }}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Border Radius */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-secondary-900 mb-6">Border Radius</h2>

          <div className="bg-white rounded-lg p-8 shadow-sm">
            <div className="grid grid-cols-4 gap-6">
              {Object.entries(designTokens.borderRadius).map(([key, value]) => (
                <div key={key} className="text-center space-y-2">
                  <div
                    className="w-24 h-24 bg-primary-500 mx-auto"
                    style={{ borderRadius: value }}
                  />
                  <p className="text-sm font-medium text-secondary-700">{key}</p>
                  <p className="text-xs text-secondary-500 font-mono">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Drawer/Modal */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-secondary-900 mb-6">Drawer / Modal</h2>

          <div className="bg-white rounded-lg p-8 shadow-sm">
            <div className="space-y-4">
              <p className="text-secondary-600">
                Right-aligned drawer component using Radix Dialog primitive. Features fixed header and footer with scrollable content area.
              </p>
              <Button variant="primary" onClick={() => setDrawerOpen(true)}>
                Open Drawer Example
              </Button>
            </div>
          </div>
        </section>
      </div>

      {/* Drawer Component Instance */}
      <AddParticipantModal open={drawerOpen} onOpenChange={setDrawerOpen} />
    </div>
  );
};