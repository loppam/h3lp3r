import { CampaignFactory, FundCampaign } from "@/contracts/types";
import { useContract, useProvider, useSigner } from "wagmi";
import { ethers } from "ethers";
import { CampaignFactory as CampaignFactoryJson } from "@/contracts/CampaignFactory.json";

// Contract addresses (replace with your deployed addresses)
export const CONTRACT_ADDRESSES = {
  factory: "YOUR_FACTORY_ADDRESS",
};

// Contract ABIs
export const CAMPAIGN_FACTORY_ABI = [
  "function createCampaign(address _tokenAddress, uint256 _goalAmount) external returns (address)",
  "function getAllCampaigns() external view returns (address[])",
  "event CampaignCreated(address indexed campaignAddress, address indexed creator, address tokenAddress, uint256 goalAmount)",
];

export const FUND_CAMPAIGN_ABI = [
  "function fund(uint256 _amount) external payable",
  "function withdraw() external",
  "function getCampaignDetails() external view returns (address, address, uint256, uint256, bool)",
  "event Funded(address indexed donor, uint256 amount)",
  "event Withdrawn(address indexed recipient, uint256 amount)",
  "event DevFeePaid(uint256 amount)",
];

export function useCampaignFactory() {
  const provider = useProvider();
  const { data: signer } = useSigner();

  return useContract({
    addressOrName: CONTRACT_ADDRESSES.factory,
    contractInterface: CAMPAIGN_FACTORY_ABI,
    signerOrProvider: signer || provider,
  });
}

export function useFundCampaign(campaignAddress: string) {
  const provider = useProvider();
  const { data: signer } = useSigner();

  return useContract({
    addressOrName: campaignAddress,
    contractInterface: FUND_CAMPAIGN_ABI,
    signerOrProvider: signer || provider,
  });
}

const CAMPAIGN_FACTORY_ADDRESS =
  process.env.NEXT_PUBLIC_CAMPAIGN_FACTORY_ADDRESS || "";

export interface Campaign {
  address: string;
  creator: string;
  goal: string;
  raised: string;
  tokenAddress: string;
  isActive: boolean;
  code: string;
}

function generateCampaignCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function createCampaign(
  tokenAddress: string,
  goal: string,
  signer: ethers.Signer
): Promise<{ address: string; code: string }> {
  const factory = new ethers.Contract(
    CAMPAIGN_FACTORY_ADDRESS,
    CampaignFactoryJson.abi,
    signer
  );

  const code = generateCampaignCode();
  const goalWei = ethers.utils.parseEther(goal);

  const tx = await factory.createCampaign(tokenAddress, goalWei, code);
  const receipt = await tx.wait();

  const event = receipt.events?.find((e: any) => e.event === "CampaignCreated");
  if (!event) throw new Error("Campaign creation failed");

  return {
    address: event.args.campaign,
    code,
  };
}

export async function getCampaigns(): Promise<Campaign[]> {
  if (!window.ethereum) throw new Error("No Ethereum provider found");

  const provider = new ethers.providers.Web3Provider(window.ethereum as any);
  const factory = new ethers.Contract(
    CAMPAIGN_FACTORY_ADDRESS,
    CampaignFactoryJson.abi,
    provider
  );

  const campaigns = await factory.getCampaigns();
  return campaigns.map((campaign: any) => ({
    address: campaign.campaign,
    creator: campaign.creator,
    goal: campaign.goal.toString(),
    raised: campaign.raised.toString(),
    tokenAddress: campaign.tokenAddress,
    isActive: campaign.isActive,
    code: campaign.code,
  }));
}

export async function getCampaignByCode(
  code: string
): Promise<Campaign | null> {
  if (!window.ethereum) throw new Error("No Ethereum provider found");

  const provider = new ethers.providers.Web3Provider(window.ethereum as any);
  const factory = new ethers.Contract(
    CAMPAIGN_FACTORY_ADDRESS,
    CampaignFactoryJson.abi,
    provider
  );

  try {
    const campaign = await factory.getCampaignByCode(code);
    return {
      address: campaign.campaign,
      creator: campaign.creator,
      goal: campaign.goal.toString(),
      raised: campaign.raised.toString(),
      tokenAddress: campaign.tokenAddress,
      isActive: campaign.isActive,
      code: campaign.code,
    };
  } catch (error) {
    return null;
  }
}

export async function fundCampaign(
  campaignAddress: string,
  amount: string,
  tokenAddress: string,
  signer: ethers.Signer
) {
  const campaign = new ethers.Contract(
    campaignAddress,
    FUND_CAMPAIGN_ABI,
    signer
  );

  const amountWei = ethers.utils.parseEther(amount);

  if (tokenAddress === ethers.constants.AddressZero) {
    // ETH funding
    const tx = await campaign.fund(amountWei, { value: amountWei });
    return tx.wait();
  } else {
    // ERC20 funding
    const tx = await campaign.fund(amountWei);
    return tx.wait();
  }
}

export async function withdrawCampaign(
  campaignAddress: string,
  signer: ethers.Signer
) {
  const campaign = new ethers.Contract(
    campaignAddress,
    FUND_CAMPAIGN_ABI,
    signer
  );

  const tx = await campaign.withdraw();
  return tx.wait();
}

export async function getCampaignDetails(
  campaignAddress: string,
  provider: ethers.providers.Provider
) {
  const campaign = new ethers.Contract(
    campaignAddress,
    FUND_CAMPAIGN_ABI,
    provider
  );

  const [creator, tokenAddress, goalAmount, totalFunds, isWithdrawn] =
    await campaign.getCampaignDetails();

  return {
    creator,
    tokenAddress,
    goalAmount: ethers.utils.formatEther(goalAmount),
    totalFunds: ethers.utils.formatEther(totalFunds),
    isWithdrawn,
  };
}
