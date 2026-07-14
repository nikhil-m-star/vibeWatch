import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 bg-black">
      <SignIn
        appearance={{
          elements: {
            card: "bg-[#0d0d0d] shadow-2xl rounded-3xl",
            headerTitle: "text-white font-black tracking-tight",
            headerSubtitle: "text-gray-400 text-xs font-semibold",
            formButtonPrimary: "bg-[#a855f7] hover:bg-[#b55fe6] text-white font-black text-xs uppercase tracking-wider py-2.5 rounded-xl cursor-pointer transition-all shadow-lg shadow-[#a855f7]/20",
            socialButtonsBlockButton: "bg-white/5 hover:bg-white/10 text-white rounded-xl cursor-pointer",
            socialButtonsBlockButtonText: "text-white font-bold text-xs",
            dividerLine: "bg-white/5",
            dividerText: "text-gray-500 text-[10px] font-bold uppercase",
            formFieldLabel: "text-gray-400 font-bold text-xs",
            formFieldInput: "bg-black/30 text-white rounded-xl focus:ring-1 focus:ring-[#a855f7]/50 text-sm",
            footerActionText: "text-gray-500 text-xs",
            footerActionLink: "text-[#a855f7] hover:text-[#b55fe6] font-bold text-xs",
            identityPreviewText: "text-white",
            identityPreviewEditButtonIcon: "text-[#a855f7]",
          },
        }}
        signUpUrl="/sign-up"
      />
    </div>
  );
}
