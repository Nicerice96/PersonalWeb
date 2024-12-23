import React from 'react';

function Body() {
    const [runningApps, setRunningApps] = React.useState(new Set());

    const launchJar = (jarName) => {
        console.log(`Attempting to launch JAR: ${jarName}`);

        fetch(`http://localhost:3001/run-jar?jar=${jarName}`)
            .then((response) => {
                if (!response.ok) {
                    return response.text().then((text) => {
                        throw new Error(`Server error: ${text}`);
                    });
                }
                return response.text();
            })
            .then((data) => {
                console.log('JAR execution response:', data);
                setRunningApps((prev) => new Set(prev).add(jarName));
                if (jarName === 'amazin') {
                    alert(`${data}\nAccess the application at: http://localhost:8080`);
                } else {
                    alert(`JAR executed: ${data}`);
                }
            })
            .catch((error) => {
                console.error('Error running JAR:', error);
                alert(`Error executing JAR: ${error.message}`);
            });
    };

    const stopJar = (jarName) => {
        fetch(`http://localhost:3001/stop-jar?jar=${jarName}`)
            .then((response) => {
                if (!response.ok) {
                    return response.text().then((text) => {
                        throw new Error(`Server error: ${text}`);
                    });
                }
                return response.text();
            })
            .then((data) => {
                console.log('Stop JAR response:', data);
                setRunningApps((prev) => {
                    const newSet = new Set(prev);
                    newSet.delete(jarName);
                    return newSet;
                });
                alert(data);
            })
            .catch((error) => {
                console.error('Error stopping JAR:', error);
                alert(`Error stopping JAR: ${error.message}`);
            });
    };

    return (
        <div className="body-container">
            <div id="intro-box">
                <p id="intro-text">
                    Hi, I'm Zarif Khan, a passionate Software Engineering student at Carleton University, graduating in 2025. I have strong expertise in Java, Python, C/C++, and web technologies like HTML, CSS, and JavaScript. I've had hands-on experience working with databases such as PostgreSQL and MongoDB, and I’m proficient in modern software development practices using Spring Boot, RESTful APIs, and cloud deployment on platforms like Azure and Google Cloud.
                </p>
            </div>
            <div id="evolution">
                <div className="timeline">
                    <div className="timeline-item">
                        <div className="timeline-content">
                            <h3>2020</h3>
                            <p>Started learning Java and Python as part of my university curriculum.</p>
                        </div>
                    </div>
                    <div className="timeline-item">
                        <div className="timeline-content">
                            <h3>2021</h3>
                            <p>Deepened knowledge in C/C++ and began working on projects using HTML, CSS, and JavaScript.</p>
                        </div>
                    </div>
                    <div className="timeline-item">
                        <div className="timeline-content">
                            <h3>2022</h3>
                            <p>Gained experience with databases like PostgreSQL and MongoDB, developing full-stack applications.</p>
                        </div>
                    </div>
                    <div className="timeline-item">
                        <div className="timeline-content">
                            <h3>2023</h3>
                            <p>Focused on modern software development practices, including Spring Boot and RESTful APIs.</p>
                        </div>
                    </div>
                    <div className="timeline-item">
                        <div className="timeline-content">
                            <h3>2024</h3>
                            <p>Gained cloud deployment experience with Azure and Google Cloud in real-world projects.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div id="github-projects">
                <div className="project-card">
                    <p>Amazin.ca</p>
                    <div className="project-buttons">
                        {!runningApps.has('amazin') ? (
                            <button 
                                className="project-button launch"
                                onClick={() => launchJar('amazin')}
                            >
                                Launch
                            </button>
                        ) : (
                            <button 
                                className="project-button stop"
                                onClick={() => stopJar('amazin')}
                            >
                                Stop Running App
                            </button>
                        )}
                        <div className={`status-indicator ${runningApps.has('amazin') ? 'running' : ''}`}>
                            {runningApps.has('amazin') ? 'Running on port 8080' : 'Stopped'}
                        </div>
                    </div>
                </div>
                <div className="project-card">
                    <p>Uno</p>
                    <div className="project-buttons">
                        <button 
                            className="project-button launch"
                            onClick={() => launchJar('uno')}
                        >
                            Launch
                        </button>
                    </div>
                </div>
                <div className="project-card">
                    <p>Active Edge</p>
                    <div className="project-buttons">
                        <button 
                            className="project-button launch"
                            onClick={() => launchJar('active-edge')}
                        >
                            Launch
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Body;
