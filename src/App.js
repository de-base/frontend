import React, { useRef, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { contractAddress, mobile } from './utils/index';
import { useMediaQuery } from 'react-responsive';

import { ethers } from 'ethers';
import { Web3ReactProvider } from '@web3-react/core';

import degov from './assets/degov.png';
import debase from './assets/debase.png';
import dai from './assets/dai.png';
import empty from './assets/empty.png';

const TokensInfo = React.lazy(() => import('./info/TokensInfo'));
const StabilizerInfo = React.lazy(() => import('./info/StabilizerInfo'));
const Landing = React.lazy(() => import('./info/Landing'));
const Parameters = React.lazy(() => import('./info/Parameters'));
const Contracts = React.lazy(() => import('./info/Contracts'));
const Distribution = React.lazy(() => import('./info/Distribution'));
const Governance = React.lazy(() => import('./info/Governance'));
const Overview = React.lazy(() => import('./info/Overview'));
const Rebase = React.lazy(() => import('./info/Rebase'));
const Asymmetrical = React.lazy(() => import('./info/Asymmetrical'));
const Ownership = React.lazy(() => import('./info/Ownership'));
const Uniswap = React.lazy(() => import('./info/Uniswap'));
const Dashboard = React.lazy(() => import('./info/Dashboard'));

const InfoLayout = React.lazy(() => import('./layout/Info'));
const DappLayout = React.lazy(() => import('./layout/Dapp'));
const Staking = React.lazy(() => import('./dapp/Staking'));
const Pool = React.lazy(() => import('./dapp/Pool'));
const Rebaser = React.lazy(() => import('./dapp/Rebaser'));

const Stabilizers = React.lazy(() => import('./dapp/stabilizers/index'));
const ThresholdCounter = React.lazy(() => import('./dapp/stabilizers/ThresholdCounter'));
const EthDebaseCounter = React.lazy(() => import('./dapp/stabilizers/RandomThresholdCounters/EthDebase'));
const BurnPool = React.lazy(() => import('./dapp/stabilizers/BurnPool'));

const DaiDebase = React.lazy(() => import('./dapp/stabilizers/ExpansionRewarder/DaiDebase'));

const Incentivizers = React.lazy(() => import('./dapp/incentivizers/index'));
const DegovEth = React.lazy(() => import('./dapp/incentivizers/DegovEth'));
const MPH88 = React.lazy(() => import('./dapp/incentivizers/MPH88'));

function getLibrary(provider) {
	const library = new ethers.providers.Web3Provider(provider);
	library.pollingInterval = 12000;
	return library;
}

function App() {
	const overviewRef = useRef(null);
	const parametersRef = useRef(null);
	const ownershipRef = useRef(null);
	const distributionRef = useRef(null);
	const stabilizerRef = useRef(null);
	const uniswapRef = useRef(null);

	const isMobile = useMediaQuery({ query: `(max-width: ${mobile}px)` });

	useEffect(() => {
		const body = document.body;
		body.classList.toggle('dark-mode');
	}, []);

	function scrollToOverview() {
		overviewRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}
	function scrollToParameters() {
		parametersRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}

	function scrollToOwnership() {
		ownershipRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}

	function scrollToStabilizer() {
		stabilizerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}

	function scrollToUniswap() {
		uniswapRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}

	return (
		<Router>
			<Suspense>
				<Switch>
					<Route path="/dapp">
						<Web3ReactProvider getLibrary={getLibrary}>
							<DappLayout>
								<Route path="/dapp/staking">
									<Route path="/dapp/staking/debase-dai">
										<Pool
											showName={true}
											tokenText="Dai"
											rewardText="Debase"
											poolName="Dai"
											unit={18}
											percents={false}
											rewardTokenImage={debase}
											stakeTokenImage={dai}
											stakeTokenAddress={contractAddress.dai}
											rewardTokenAddress={contractAddress.debase}
											poolAddress={contractAddress.debaseDaiPool}
										/>
									</Route>
									<Route path="/dapp/staking/debase-dai-lp">
										<Pool
											showName={true}
											tokenText="Dai-lp"
											rewardText="Debase"
											poolName="Debase/Dai-lp"
											unit={18}
											percents={false}
											rewardTokenImage={debase}
											stakeTokenImage={empty}
											stakeTokenAddress={contractAddress.debaseDaiLp}
											rewardTokenAddress={contractAddress.debase}
											poolAddress={contractAddress.debaseDaiLpPool}
										/>
									</Route>
									<Route path="/dapp/staking/degov-dai-lp">
										<Pool
											showName={true}
											tokenText="Dai-lp"
											rewardText="Degov"
											poolName="Debase/Dai-lp"
											unit={18}
											percents={false}
											rewardTokenImage={degov}
											stakeTokenImage={empty}
											stakeTokenAddress={contractAddress.debaseDaiLp}
											rewardTokenAddress={contractAddress.degov}
											poolAddress={contractAddress.degovDaiLpPool}
										/>
									</Route>
									<Route exact path="/dapp/staking">
										<Staking />
									</Route>
								</Route>
								<Route path="/dapp/stabilizers">
									<Route path="/dapp/stabilizers/expansion-rewarder-dai-debase">
										<DaiDebase />
									</Route>
									<Route path="/dapp/stabilizers/thresholdCounter-v2-eth-debase">
										<EthDebaseCounter />
									</Route>
									<Route path="/dapp/stabilizers/thresholdCounter">
										<ThresholdCounter />
									</Route>
									<Route exact path="/dapp/stabilizers/burnPool">
										<BurnPool />
									</Route>
									<Route exact path="/dapp/stabilizers">
										<Stabilizers />
									</Route>
								</Route>
								<Route path="/dapp/incentivizers">
									<Route path="/dapp/incentivizers/mph88-debase-dai">
										<MPH88 />
									</Route>
									<Route path="/dapp/incentivizers/degov-eth">
										<DegovEth />
									</Route>
									<Route exact path="/dapp/incentivizers">
										<Incentivizers />
									</Route>
								</Route>
								<Route path="/dapp/rebase">
									<Rebaser />
								</Route>
							</DappLayout>
						</Web3ReactProvider>
					</Route>

					<Route path="/info/dashboard">
						<InfoLayout>
							<Dashboard />
						</InfoLayout>
					</Route>

					<Route path="/">
						<InfoLayout>
							<Landing scrollToOverview={scrollToOverview} />
							<TokensInfo isMobile={isMobile} />
							<Overview
								isMobile={isMobile}
								ref={overviewRef}
								scrollToOwnership={scrollToOwnership}
								scrollToStabilizer={scrollToStabilizer}
								scrollToParameters={scrollToParameters}
								scrollToUniswap={scrollToUniswap}
							/>
							<Rebase isMobile={isMobile} />
							<Asymmetrical isMobile={isMobile} />
							<StabilizerInfo ref={stabilizerRef} scrollToUniswap={scrollToUniswap} isMobile={isMobile} />
							<Uniswap ref={uniswapRef} isMobile={isMobile} />
							<Governance
								scrollToParameters={scrollToParameters}
								scrollToOwnership={scrollToOwnership}
								isMobile={isMobile}
							/>
							<Distribution ref={distributionRef} isMobile={isMobile} />
							<Parameters ref={parametersRef} />
							<Contracts />
							<Ownership ref={ownershipRef} />
						</InfoLayout>
					</Route>
				</Switch>
			</Suspense>
		</Router>
	);
}

export default App;
