import clsx from "clsx";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
};

export function Card({ className, children, ...props }: CardProps) {
  return <div className={clsx("glass rounded-lg p-5", className)} {...props}>{children}</div>;
}
