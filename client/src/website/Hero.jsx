import './Hero.css';
import HyperSpeed from './helper/HyperSpeed';

export default function Hero() {
    return (
        <div 
            style={{
                width: '100%', 
                height: '100vh', 
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '0.5rem'
            }}
        >
            <div className="heading-text">
                Welcome to DevLoft
            </div>
            
            <div 
                className="sub-heading-text" 
                style={{
                    marginTop: '-1.5rem'
                }}
            >
                A Collaborative Web IDE for Developers
            </div> 

            <button 
                onClick={() => {
                    window.location.href = '/generate-room'
                }}
                className="hero-button"
                style={{
                    marginTop: '2rem',
                }}
            >
                Get Started
            </button>
        
            <HyperSpeed
                effectOptions={{
                    onSpeedUp: () => { },
                    onSlowDown: () => { },
                    distortion: 'turbulentDistortion',
                    length: 400,
                    roadWidth: 10,
                    islandWidth: 2,
                    lanesPerRoad: 20,
                    fov: 90,
                    fovSpeedUp: 150,
                    speedUp: 2,
                    carLightsFade: 0.4,
                    totalSideLightSticks: 100,
                    lightPairsPerRoadWay: 50,
                    shoulderLinesWidthPercentage: 0.05,
                    brokenLinesWidthPercentage: 0.1,
                    brokenLinesLengthPercentage: 0.5,
                    lightStickWidth: [0.12, 0.5],
                    lightStickHeight: [1.3, 1.7],
                    movingAwaySpeed: [60, 80],
                    movingCloserSpeed: [-120, -160],
                    carLightsLength: [400 * 0.03, 400 * 0.2],
                    carLightsRadius: [0.05, 0.14],
                    carWidthPercentage: [0.3, 0.5],
                    carShiftX: [-0.8, 0.8],
                    carFloorSeparation: [0, 5],
                    colors: {
                        roadColor: 0x080808,
                        islandColor: 0x0a0a0a,
                        background: 0x000000,
                        shoulderLines: 0xFFFFFF,
                        brokenLines: 0xFFFFFF,
                        leftCars: [0xD856BF, 0x6750A2, 0xC247AC],
                        rightCars: [0x03B3C3, 0x0E5EA5, 0x324555],
                        sticks: 0x03B3C3,
                    }
                }}
            />
        </div>
    )
}
