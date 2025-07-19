import { useEffect, useState } from "react"
import { useMarkDown } from '@/contexts/MarkDownContext'
import MarkDownBlock from '@/components/MarkDownBlock'
import LoadingPlaceholder from '@/components/LoadingPlaceholder'

const Footer = () => {
  
  return (
    <footer className="main-footer py-8 mt-4 border-t-2 pt-8 text-center">
      <p>
        © Powered by <a href="https://whitelotto.com" target="_blank">WhiteLotto.com</a> - Lottery White Label and Turnkey Platform Provider.
      </p>
    </footer>
  );
};

export default Footer;