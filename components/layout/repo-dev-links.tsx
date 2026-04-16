'use client'

import { FaGithub } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/hooks/use-language'

const GITHUB_REPO_URL = 'https://github.com/iyehah/rimInvoice'
const PORTFOLIO_URL = 'https://iyehah.com'

interface RepoDevLinksProps {
  className?: string
}

export function RepoDevLinks({ className }: RepoDevLinksProps) {
  const { t } = useLanguage()

  return (
    <div className={`flex items-center gap-1 sm:gap-2 ${className ?? ''}`}>
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground"
        asChild
      >
        <a
          href={GITHUB_REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          title={t('layout.githubRepo')}
          aria-label={t('layout.githubRepo')}
        >
          <FaGithub className="h-5 w-5" />
        </a>
      </Button>
      <a
        href={PORTFOLIO_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="whitespace-nowrap text-xs font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline sm:text-sm"
      >
        {t('layout.devByPortfolio')}
      </a>
    </div>
  )
}
