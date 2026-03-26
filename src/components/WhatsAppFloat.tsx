export default function WhatsAppFloat() {
  return (
    <a 
      href="https://wa.me/94756363427" 
      target="_blank" 
      rel="noopener noreferrer"
      className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 group flex items-center justify-center w-12 h-12 md:w-14 md:h-14 bg-[#25D366] rounded-full shadow-[0_4px_14px_0_rgba(37,211,102,0.39)] hover:shadow-[0_6px_20px_rgba(37,211,102,0.23)] hover:scale-110 transition-all duration-300"
    >
      {/* Tooltip */}
      <div className="absolute right-16 px-3 py-1.5 bg-[#000000] border border-white/10 text-white text-xs font-semibold rounded-md opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300 whitespace-nowrap pointer-events-none shadow-lg hidden md:block">
        Chat with us
        <div className="absolute top-1/2 -right-1 w-2 h-2 bg-[#000000] border-t border-r border-white/10 transform -translate-y-1/2 rotate-45"></div>
      </div>
      
      {/* WhatsApp SVG Icon */}
      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.666.598 1.236.784 1.409.87.173.087.318.072.433-.058.116-.13.506-.61.641-.818.134-.208.268-.173.422-.116.154.058.981.462 1.154.549.173.087.289.13.332.202.043.073.043.423-.101.828zM11.994 2C6.471 2 2 6.471 2 11.994c0 1.926.551 3.766 1.524 5.307l-1.506 5.518 5.637-1.477A9.958 9.958 0 0011.994 22c5.522 0 9.999-4.477 9.999-9.999S17.516 2 11.994 2z"/>
      </svg>
    </a>
  );
}
