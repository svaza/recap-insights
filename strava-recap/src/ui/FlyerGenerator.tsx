/**
 * FlyerGenerator component
 * Renders the flyer visual with background, overlays, and stats
 */

import { useState, useRef, useCallback } from 'react';
import { toPng } from 'html-to-image';
import type { FlyerData, FlyerAlignment } from '../models/flyer';
import { getAlignmentClass } from '../utils/flyerStats';
import './FlyerGenerator.css';

type FlyerGeneratorProps = {
    data: FlyerData;
};

export default function FlyerGenerator({ data }: FlyerGeneratorProps) {
    const [alignment, setAlignment] = useState<FlyerAlignment>('left');
    const [isExporting, setIsExporting] = useState(false);
    const flyerRef = useRef<HTMLDivElement>(null);

    const handleAlignmentChange = (newAlignment: FlyerAlignment) => {
        setAlignment(newAlignment);
    };

    const handleExport = useCallback(async () => {
        if (!flyerRef.current || isExporting) return;

        setIsExporting(true);
        try {
            const dataUrl = await toPng(flyerRef.current, {
                pixelRatio: 2,
                cacheBust: true,
            });

            // Create download link
            const link = document.createElement('a');
            link.download = `${data.athleteFirstName}-${data.groupInfo.label}-flyer.png`;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error('Failed to export flyer:', error);
        } finally {
            setIsExporting(false);
        }
    }, [data.athleteFirstName, data.groupInfo.label, isExporting]);

    const alignmentClass = getAlignmentClass(alignment);

    return (
        <div className="flyer-container">
            {/* Controls */}
            <div className="flyer-controls mb-4">
                <div className="d-flex flex-wrap gap-2 justify-content-center align-items-center">
                    <div className="btn-group" role="group" aria-label="Text alignment">
                        <button
                            type="button"
                            className={`btn btn-sm ${alignment === 'left' ? 'btn-primary' : 'btn-outline-secondary'}`}
                            onClick={() => handleAlignmentChange('left')}
                        >
                            Left
                        </button>
                        <button
                            type="button"
                            className={`btn btn-sm ${alignment === 'right' ? 'btn-primary' : 'btn-outline-secondary'}`}
                            onClick={() => handleAlignmentChange('right')}
                        >
                            Right
                        </button>
                        <button
                            type="button"
                            className={`btn btn-sm ${alignment === 'bottom' ? 'btn-primary' : 'btn-outline-secondary'}`}
                            onClick={() => handleAlignmentChange('bottom')}
                        >
                            Bottom
                        </button>
                    </div>
                    <button
                        type="button"
                        className="btn btn-success btn-sm"
                        onClick={handleExport}
                        disabled={isExporting}
                    >
                        {isExporting ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Exporting...
                            </>
                        ) : (
                            <>📥 Download PNG</>
                        )}
                    </button>
                </div>
            </div>

            {/* Flyer Preview */}
            <div className="flyer-preview-wrapper">
                <div
                    ref={flyerRef}
                    className={`flyer-preview ${alignmentClass}`}
                    style={{
                        backgroundImage: `url(${data.groupInfo.backgroundPath})`,
                    }}
                >
                    {/* Gradient overlay for text readability */}
                    <div className="flyer-gradient-overlay"></div>

                    {/* Content overlay */}
                    <div className="flyer-content">
                        {/* Header */}
                        <div className="flyer-header">
                            <div className="flyer-athlete-name">{data.athleteFirstName}'s</div>
                            <div className="flyer-title-subtitle">Recap Insights</div>
                            <div className="flyer-date-range">{data.rangeLabel}</div>
                            <div className="flyer-group-label">{data.groupInfo.label}</div>
                        </div>

                        {/* Stats */}
                        <div className="flyer-stats">
                            {data.stats.map((stat) => (
                                <div key={stat.id} className="flyer-stat-item">
                                    <div className="flyer-stat-value">{stat.formattedValue}</div>
                                    <div className="flyer-stat-label">{stat.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Footer branding */}
                        <div className="flyer-footer">
                            <span className="flyer-brand">generated using recapinsights.link</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Export info */}
            <p className="text-secondary small text-center mt-3">
                Preview shown at reduced size. Download exports at 1080×1920px.
            </p>
        </div>
    );
}
