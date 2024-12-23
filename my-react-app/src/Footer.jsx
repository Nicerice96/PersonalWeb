
import resume from './assets/resume.pdf';
function Footer(){


    return (
        <footer className="footer">
            <ul>
                <li><a href={resume} className="download-resume">View Resume</a></li>
                <li><p>Phone: 613-981-9377</p></li>
                <li><p>Gmail: zarifzawadkhan96@gmail.com</p></li>
                <li><p>Instagram: nicerice96</p></li>
            </ul>
        </footer>


    );




}


export default Footer