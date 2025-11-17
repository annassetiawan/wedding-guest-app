interface PageHeaderProps {
  title: string
  subtitle?: string | React.ReactNode
  action?: React.ReactNode
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {subtitle && (
          typeof subtitle === 'string' ? (
            <p className="text-muted-foreground mt-1">{subtitle}</p>
          ) : (
            <div className="mt-1">{subtitle}</div>
          )
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
