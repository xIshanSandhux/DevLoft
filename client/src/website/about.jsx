import Particles from './helper/particles';

export default function About() {
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
        gap: '0.5rem',
        paddingTop: '80px',
        boxSizing: 'border-box'
    }}
    >
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1
      }}>
        <Particles 
          particleCount={500}
          particleSpread={10}
          speed={0.1}
          particleColors={['#03B3C3', '#6750A2', '#D856BF']}
          moveParticlesOnHover={false}
          particleHoverFactor={1.5}
        />
      </div>
      
      {/* Content overlay */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        textAlign: 'center',
        color: 'white'
      }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>About DevLoft</h1>
        <p style={{ fontSize: '1.2rem', maxWidth: '600px' }}>
        DevLoft is Google Docs for code — a blazing-fast, real-time code editor built for teams, bootcamps, and hackathons. Import full project folders, write code live with your team, and talk it out with built-in voice chat — all in the browser, no setup needed. <br />
        <br />
        We’re reimagining collaborative programming to be as seamless and social as coding in the same room. Whether you're pair programming, mentoring, or debugging together — DevLoft makes it instant, interactive, and effortless.
        </p>
      </div>
    </div>
  );
}