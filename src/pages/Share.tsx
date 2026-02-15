import ShareExport from '@/components/simulator/ShareExport';

export default function Share() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          Share & Export
        </h1>
        <p className="mt-2 text-muted-foreground">
          Help your team understand the quantum threat. Export scenarios and share this resource.
        </p>
      </div>

      <ShareExport
        encryptionType="RSA_2048"
        year={2035}
        messagesIntercepted={0}
      />
    </div>
  );
}
