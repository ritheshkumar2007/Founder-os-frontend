import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        className:
          "!bg-[#101417] !text-white !border !border-[rgba(139,92,246,0.3)] !shadow-[0_20px_50px_rgba(0,0,0,0.85)] !backdrop-blur-xl !rounded-2xl !p-4 !font-sans",
        descriptionClassName: "!text-[#cbc3d7] !text-xs !mt-1 !font-sans leading-relaxed",
      }}
      {...props}
    />
  );
};

export { Toaster };
