const Footer = () => {
  return (
    <footer className="w-full">
      <div className="h-16 flex justify-center items-center">
        <p className="text-xs text-gray-500">
          &copy; {new Date().getFullYear()} SDJHRCA. ICT Asset Management
          System. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
export default Footer;
