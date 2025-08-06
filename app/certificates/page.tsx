"use client";

import { useState, useEffect } from "react";
import { Certificate } from "@/app/types";
import { useWeb3 } from "@/context/Web3Context";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, ExternalLink, Calendar, Sparkles } from "lucide-react";

export default function CertificatesPage() {
  const { account, user } = useWeb3();
  const { toast } = useToast();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [mintingLoading, setMintingLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchCertificates = async () => {
      if (!account || !user) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/certificates?recipientId=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setCertificates(data.certificates || []);
        } else {
          console.error("Failed to fetch certificates");
        }
      } catch (error) {
        console.error("Error fetching certificates:", error);
        toast({
          title: "Error",
          description: "Failed to load certificates.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, [account, user, toast]);

  const handleMintCertificate = async (certificateId: string) => {
    setMintingLoading(certificateId);

    try {
      const res = await fetch("/api/certificates/mint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          certificateId,
        }),
      });

      if (res.ok) {
        const data = await res.json();

        // Update certificates list
        setCertificates((prev) =>
          prev.map((cert) =>
            cert.id === certificateId ? { ...cert, ...data.certificate } : cert
          )
        );

        toast({
          title: "Certificate minted!",
          description: data.message,
        });
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error);
      }
    } catch (error: any) {
      console.error("Error minting certificate:", error);
      toast({
        title: "Minting failed",
        description: error.message || "Failed to mint certificate.",
        variant: "destructive",
      });
    } finally {
      setMintingLoading(null);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "minted":
        return "bg-green-500/10 text-green-500";
      case "pending":
        return "bg-yellow-500/10 text-yellow-500";
      case "failed":
        return "bg-red-500/10 text-red-500";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading certificates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 md:py-12 px-4 max-w-7xl">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">My Certificates</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              View and manage your earned certificates from completed learning
              sessions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.length > 0 ? (
              certificates.map((certificate) => (
                <Card
                  key={certificate.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl flex items-center gap-2">
                        <Award className="h-5 w-5 text-yellow-500" />
                        {certificate.skillName}
                      </CardTitle>
                      <Badge className={getStatusColor(certificate.status)}>
                        {certificate.status.charAt(0).toUpperCase() +
                          certificate.status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Issued on {formatDate(certificate.createdAt)}
                        </span>
                      </div>

                      {certificate.tokenId && (
                        <div className="text-sm">
                          <span className="font-medium">Token ID:</span> #
                          {certificate.tokenId}
                        </div>
                      )}

                      <div className="flex gap-2">
                        {certificate.status === "pending" && (
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() =>
                              handleMintCertificate(certificate.id)
                            }
                            disabled={mintingLoading === certificate.id}
                          >
                            <Sparkles className="mr-2 h-4 w-4" />
                            {mintingLoading === certificate.id
                              ? "Minting..."
                              : "Mint NFT"}
                          </Button>
                        )}

                        {certificate.status === "minted" && (
                          <>
                            {certificate.txHash && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                asChild
                              >
                                <a
                                  href={`https://etherscan.io/tx/${certificate.txHash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  View on Etherscan
                                  <ExternalLink className="ml-2 h-4 w-4" />
                                </a>
                              </Button>
                            )}

                            {certificate.metadataUri && (
                              <Button size="sm" className="flex-1" asChild>
                                <a
                                  href={certificate.metadataUri}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  View Certificate
                                  <ExternalLink className="ml-2 h-4 w-4" />
                                </a>
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12 border rounded-lg border-dashed">
                <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  You haven&apos;t earned any certificates yet
                </p>
                <Button asChild>
                  <a href="/tutors">Start Learning</a>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
