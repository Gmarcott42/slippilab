import { HTMLProps } from "react";

export function PrimaryButton({
  className,
  children,
  ...props
}: HTMLProps<HTMLButtonElement>) {
  return (
    <button
      className={`inline-flex w-fit items-center rounded-md border border-transparent bg-slippi-400 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slippi-500 focus:outline-none focus:ring-2 focus:ring-slippi-500 focus:ring-offset-2 ${
        className ?? ""
      }`}
      {...props}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  className,
  children,
  ...props
}: HTMLProps<HTMLButtonElement>) {
  return (
    <button
      className={`inline-flex w-fit items-center rounded-md border border-transparent bg-slippi-100 px-4 py-2 text-sm font-medium text-slippi-700 hover:bg-slippi-200 focus:outline-none focus:ring-2 focus:ring-slippi-500 focus:ring-offset-2 ${
        className ?? ""
      }`}
      {...props}
    >
      {children}
    </button>
  );
}

export function WhiteButton({
  className,
  children,
  ...props
}: HTMLProps<HTMLButtonElement>) {
  return (
    <button
      className={`inline-flex w-fit items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-slippi-500 focus:ring-offset-2 ${
        className ?? ""
      }`}
      {...props}
    >
      {children}
    </button>
  );
}
