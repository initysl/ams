const About = () => {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">About</h2>

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Application Information</h3>
          {/* Fix alignment here */}
          <p className="text-gray-600 text-pretty">
            This application is designed to manage attendance tracking using QR
            codes in tetiary institution(s). It provides an easy way for
            lecturers to generate dynamic QR codes for classes and for students
            to scan these codes to mark their attendance.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-medium">Version</h3>
          <p className="text-gray-600">v1.0.0</p>
        </div>

        <div>
          <h3 className="text-lg font-medium">Developer</h3>
          <p className="text-gray-600">
            Developed by{" "}
              <a
              href='https://x.com/initysl'
              target='_blank'
              rel='noopener noreferrer'
              className='text-slate-400 hover:text-slate-700 underline transition-colors duration-150'
              aria-label='X (Twitter)'
            >initysl
            </a>
          </p>
        </div>

        <div>
          <h3 className="text-lg font-medium">Contact</h3>
          <p className="text-gray-600">
            For support or inquiries, please contact:{" "}
            <a
              href='https://x.com/initysl'
              target='_blank'
              rel='noopener noreferrer'
              className='text-slate-400 hover:text-slate-700 underline transition-colors duration-150'
              aria-label='X (Twitter)'
            >initysl
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
