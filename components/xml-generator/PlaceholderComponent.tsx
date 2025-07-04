interface PlaceholderComponentProps {
  title: string
}

export function PlaceholderComponent({ title }: PlaceholderComponentProps) {
  return (
    <div className="text-center py-8 text-muted-foreground">
      {title} step is under construction...
    </div>
  )
} 