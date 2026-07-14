import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 bg-[#08090c]">
      <SignIn
        appearance={{
          elements: {
            card: "bg-[#11131a] border border-white/5 shadow-2xl rounded-3xl",
            headerTitle: "text-white font-black tracking-tight",
            headerSubtitle: "text-gray-400 text-xs font-semibold",
            formButtonPrimary: "bg-gradient-to-r from-red-500 to-orange-500 hover:opacity-90 transition-opacity text-white font-black text-xs uppercase tracking-wider py-2.5 rounded-xl cursor-pointer",
            socialButtonsBlockButton: "bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl cursor-pointer",
            socialButtonsBlockButtonText: "text-white font-bold text-xs",
            dividerLine: "bg-white/5",
            dividerText: "text-gray-500 text-[10px] font-bold uppercase",
            formFieldLabel: "text-gray-400 font-bold text-xs",
            formFieldInput: "bg-black/30 border border-white/10 text-white rounded-xl focus:border-orange-500/50 text-sm",
            footerActionText: "text-gray-500 text-xs",
            footerActionLink: "text-orange-400 hover:text-orange-300 font-bold text-xs",
            identityPreviewText: "text-white",
            identityPreviewEditButtonIcon: "text-orange-400",
          },
        }}
        signUpUrl="/sign-up"
      />
    </div>
  );
}
