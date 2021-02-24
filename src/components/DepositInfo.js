import React, { useEffect, Fragment } from 'react';
import { useWeb3React } from '@web3-react/core';
import { lpAbi, fetcher, mph88Abi } from '../utils/index';
import useSWR from 'swr';
import { DateTime } from 'luxon';
import { formatEther, parseEther } from 'ethers/lib/utils';
import TextInfo from './TextInfo.js';
import { BigNumber } from 'ethers';

export default function DepositInfo({
	rewardTokenAddress,
	poolAddress,
	rewardText,
	rewardTokenImage,
	deposit,
	isMobile,
	dai,
	mph88
}) {
	const { library } = useWeb3React();

	const TOTAL_GONS = BigNumber.from('115792089237316195423570985008687907853269984665640564000000000000000000000000');

	const { data: debaseSupply, mutate: getDebaseSupply } = useSWR([ rewardTokenAddress, 'totalSupply' ], {
		fetcher: fetcher(library, lpAbi)
	});

	const { data: debaseAccrued, mutate: getDebaseAccrued } = useSWR([ poolAddress, 'earned', deposit.id ], {
		fetcher: fetcher(library, mph88Abi)
	});

	useEffect(
		() => {
			library.on('block', () => {
				getDebaseSupply(undefined, true);
				getDebaseAccrued(undefined, true);
			});
			return () => {
				library.removeAllListeners('block');
			};
		},
		[ library, getDebaseSupply, getDebaseAccrued ]
	);

	return (
		<Fragment>
			<TextInfo
				isMobile={isMobile}
				label="Deposit unlocks in"
				value={DateTime.fromSeconds(deposit.maturationTimestamp.toNumber()).toRelative({ round: false })}
				token={rewardText}
				noImage={true}
				img={rewardTokenImage}
			/>
			<TextInfo
				isMobile={isMobile}
				label="Deposit Lp Staked"
				value={parseFloat(formatEther(deposit.amount)).toFixed(isMobile ? 4 : 8) * 1}
				token="Debase/Dai Lp"
				img={rewardTokenImage}
			/>

			<TextInfo
				isMobile={isMobile}
				label="Dai Unlocked From Lp"
				value={parseFloat(formatEther(deposit.daiAmount)).toFixed(isMobile ? 4 : 8) * 1}
				token="Dai"
				img={dai}
			/>

			<TextInfo
				isMobile={isMobile}
				label="Dai earned from deposit"
				value={parseFloat(deposit.interestEarnedOnDai).toFixed(isMobile ? 4 : 8) * 1}
				token="Dai"
				img={dai}
			/>

			<TextInfo
				isMobile={isMobile}
				label="Debase Unlocked From Lp"
				value={
					debaseSupply !== undefined ? (
						parseFloat(formatEther(deposit.debaseReward.div(TOTAL_GONS.div(debaseSupply)))).toFixed(4)
					) : (
						'...'
					)
				}
				token={rewardText}
				img={rewardTokenImage}
			/>

			<TextInfo
				isMobile={isMobile}
				label="88Mph Reward"
				value={parseFloat(deposit.mphReward * 0.51).toFixed(isMobile ? 4 : 8) * 1}
				token="88MPH"
				img={mph88}
			/>

			<TextInfo
				isMobile={isMobile}
				label="Debase Accrued"
				value={
					debaseAccrued !== undefined && debaseSupply !== undefined ? (
						parseFloat(formatEther(debaseAccrued.mul(debaseSupply).div(parseEther('1')))).toFixed(
							isMobile ? 4 : 8
						) * 1
					) : (
						'0'
					)
				}
				token={rewardText}
				img={rewardTokenImage}
			/>
		</Fragment>
	);
}
