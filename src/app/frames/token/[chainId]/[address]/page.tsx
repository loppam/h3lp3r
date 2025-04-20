import { Metadata } from "next";
import { base } from "wagmi/chains";

const appUrl = process.env.NEXT_PUBLIC_URL;

interface Props {
  params: Promise<{
    chainId: string;
    address: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { chainId, address } = await params;
  // Default to Base chain if not specified
  const effectiveChainId = chainId || base.id.toString();
  const token = `eip155:${effectiveChainId}/erc20:${address}`;

  const frame = {
    version: "next",
    imageUrl: `${appUrl}/frames/token/${effectiveChainId}/${address}/opengraph-image`,
    aspectRatio: "1:1",
    button: {
      title: "View Token",
      action: {
        type: "view_token",
        token,
      },
    },
  };

  return {
    title: "View Token",
    description: token,
    openGraph: {
      title: "View Token",
      description: token,
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

export default async function HelloNameFrame({ params }: Props) {
  const { chainId, address } = await params;
  // Default to Base chain if not specified
  const effectiveChainId = chainId || base.id.toString();
  const token = `eip155:${effectiveChainId}/erc20:${address}`;

  return <h1>View token: {token}</h1>;
}
