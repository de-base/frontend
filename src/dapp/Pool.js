import React, { useState, useEffect, useRef } from 'react';
import { useWeb3React } from '@web3-react/core';
import { poolAbi, lpAbi, toaster, fetcher } from '../utils/index';
import useSWR from 'swr';
import { useHistory } from 'react-router-dom';
import { formatEther, formatUnits, parseEther, parseUnits } from 'ethers/lib/utils';
import { Contract } from 'ethers';
import TextInfo from '../components/TextInfo.js';
import PoolInput from '../components/PoolInput';
import { useMediaQuery } from 'react-responsive';

export default function Pool({
	poolName,
	stakeTokenAddress,
	poolAddress,
	rewardTokenAddress,
	tokenText,
	rewardText,
	rewardTokenImage,
	stakeTokenImage,
	unit,
	showName,
	percents
}) {
	let history = useHistory();
	const stakeRef = useRef();
	const withdrawRef = useRef();

	const { account, library } = useWeb3React();

	const { data: rewardTokenBalance, mutate: getRewardTokenBalance } = useSWR(
		[ rewardTokenAddress, 'balanceOf', account ],
		{
			fetcher: fetcher(library, lpAbi)
		}
	);

	const { data: tokenBalance, mutate: getTokenBalance } = useSWR([ stakeTokenAddress, 'balanceOf', account ], {
		fetcher: fetcher(library, lpAbi)
	});

	const { data: tokenSupply, mutate: getTokenSupply } = useSWR([ rewardTokenAddress, 'totalSupply' ], {
		fetcher: fetcher(library, lpAbi)
	});

	const { data: stakeBalance, mutate: getStakeBalance } = useSWR([ poolAddress, 'balanceOf', account ], {
		fetcher: fetcher(library, poolAbi)
	});

	const { data: rewardBalance, mutate: getRewardBalance } = useSWR([ poolAddress, 'earned', account ], {
		fetcher: fetcher(library, poolAbi)
	});

	const isMobile = useMediaQuery({ query: `(max-width: 482px)` });

	const [ stakingLoading, setStakingLoading ] = useState(false);
	const [ withdrawLoading, setWithdrawLoading ] = useState(false);
	const [ claimLoading, setClaimLoading ] = useState(false);
	const [ claimUnstakeLoading, setClaimUnstakeLoading ] = useState(false);

	useEffect(
		() => {
			library.on('block', () => {
				getRewardTokenBalance(undefined, true);
				getTokenBalance(undefined, true);
				getRewardBalance(undefined, true);
				getStakeBalance(undefined, true);
				getTokenSupply(undefined, true);
			});
			return () => {
				library.removeAllListeners('block');
			};
		},
		[ library, getStakeBalance, getRewardBalance, getTokenBalance, getRewardTokenBalance, getTokenSupply ]
	);

	async function handleStake() {
		setStakingLoading(true);
		const tokenContract = new Contract(stakeTokenAddress, lpAbi, library.getSigner());
		const poolContract = new Contract(poolAddress, poolAbi, library.getSigner());
		try {
			const toStake = parseUnits(stakeRef.current.value, unit);
			let allowance = await tokenContract.allowance(account, poolAddress);
			let transaction;
			if (allowance.lt(toStake)) {
				transaction = await tokenContract.approve(poolAddress, toStake);
				await transaction.wait(1);
			}
			transaction = await poolContract.stake(toStake);
			await transaction.wait(1);

			let newTokenBal = await tokenContract.balanceOf(account);
			let newStakeBal = await poolContract.balanceOf(account);

			await getStakeBalance(newStakeBal);
			await getTokenBalance(newTokenBal);

			toaster('Staking successfully executed', 'is-success');
		} catch (error) {
			toaster('Staking failed, please try again', 'is-danger');
		}
		setStakingLoading(false);
	}

	async function handleWithdraw() {
		setWithdrawLoading(true);
		const tokenContract = new Contract(stakeTokenAddress, lpAbi, library.getSigner());
		const poolContract = new Contract(poolAddress, poolAbi, library.getSigner());
		try {
			const toWithdraw = parseUnits(withdrawRef.current.value, unit);
			let transaction = await poolContract.withdraw(toWithdraw);
			await transaction.wait(1);

			let newTokenBal = await tokenContract.balanceOf(account);
			let newStakeBal = await poolContract.balanceOf(account);
			await getTokenBalance(newTokenBal);
			await getStakeBalance(newStakeBal);

			toaster('Withdraw successfully executed', 'is-success');
		} catch (error) {
			console.log(error);
			toaster('Withdraw failed, please try again', 'is-danger');
		}
		setWithdrawLoading(false);
	}

	async function claimReward() {
		setClaimLoading(true);
		const poolContract = new Contract(poolAddress, poolAbi, library.getSigner());
		try {
			const transaction = await poolContract.getReward();
			await transaction.wait(1);

			let newRewardBal = await poolContract.earned(account);
			await getRewardBalance(newRewardBal);

			toaster('Claim reward successful', 'is-success');
		} catch (error) {
			toaster('Claim reward failed, please try again', 'is-danger');
		}
		setClaimLoading(false);
	}

	async function claimRewardThenUnstake() {
		setClaimUnstakeLoading(true);
		const poolContract = new Contract(poolAddress, poolAbi, library.getSigner());
		const tokenContract = new Contract(stakeTokenAddress, lpAbi, library.getSigner());

		try {
			const transaction = await poolContract.exit();
			await transaction.wait(1);

			let newTokenBal = await tokenContract.balanceOf(account);
			let newStakeBal = await poolContract.balanceOf(account);
			let newRewardBal = await poolContract.earned(account);

			await getStakeBalance(newStakeBal);
			await getTokenBalance(newTokenBal);
			await getRewardBalance(newRewardBal);

			toaster('Claim and unstake successfully executed', 'is-success');
		} catch (error) {
			toaster('Claim and unstake failed, please try again', 'is-danger');
		}
		setClaimUnstakeLoading(false);
	}

	const data = (
		<div className="boxs has-text-centered">
			{showName ? (
				<div>
					<h2 className=" title is-size-4-tablet is-size-5-mobile is-family-secondary">{poolName}</h2>
					<button className="delete is-pulled-right" onClick={() => history.goBack()} />
				</div>
			) : null}
			<table className="table is-fullwidth">
				<tbody>
					<TextInfo
						isMobile={isMobile}
						label="Balance"
						value={
							rewardTokenBalance !== undefined ? (
								parseFloat(formatEther(rewardTokenBalance)).toFixed(isMobile ? 4 : 8) * 1
							) : (
								'0'
							)
						}
						token={rewardText}
						img={rewardTokenImage}
					/>
					<TextInfo
						isMobile={isMobile}
						label="Claimable"
						value={
							percents ? rewardBalance !== undefined && tokenSupply !== undefined ? (
								parseFloat(formatEther(rewardBalance.mul(tokenSupply).div(parseEther('1')))).toFixed(
									isMobile ? 4 : 8
								) * 1
							) : (
								'0'
							) : rewardBalance !== undefined ? (
								parseFloat(formatEther(rewardBalance)).toFixed(isMobile ? 4 : 8) * 1
							) : (
								'0'
							)
						}
						token={rewardText}
						img={rewardTokenImage}
					/>
					<TextInfo
						isMobile={isMobile}
						label="To Stake"
						value={
							tokenBalance !== undefined ? (
								parseFloat(formatUnits(tokenBalance, unit)).toFixed(isMobile ? 6 : 10) * 1
							) : (
								'0'
							)
						}
						token={tokenText}
						img={stakeTokenImage}
					/>
					<TextInfo
						isMobile={isMobile}
						label="Staked"
						value={
							stakeBalance !== undefined ? (
								parseFloat(formatUnits(stakeBalance, unit)).toFixed(isMobile ? 6 : 10) * 1
							) : (
								'0'
							)
						}
						token={tokenText}
						img={stakeTokenImage}
					/>
				</tbody>
			</table>
			<div className="columns">
				<div className="column">
					<PoolInput
						action={handleStake}
						loading={stakingLoading}
						buttonText="Stake Amount"
						ref={stakeRef}
						balance={tokenBalance}
						placeholderText="Stake Amount"
						unit={unit}
					/>
					<button
						className={
							claimLoading ? (
								'mt-2 button is-loading is-link is-fullwidth is-edged'
							) : (
								'mt-2 button is-link is-fullwidth is-edged'
							)
						}
						onClick={claimReward}
					>
						Claim Reward
					</button>
				</div>
				<div className="column">
					<PoolInput
						action={handleWithdraw}
						loading={withdrawLoading}
						buttonText="Withdraw Amount"
						ref={withdrawRef}
						balance={stakeBalance}
						placeholderText="Withdraw Amount"
						unit={unit}
					/>
					<button
						className={
							claimUnstakeLoading ? (
								'mt-2 button is-loading is-link is-fullwidth is-edged'
							) : (
								'mt-2 button is-link is-fullwidth is-edged'
							)
						}
						onClick={claimRewardThenUnstake}
					>
						Claim Reward & Unstake
					</button>
				</div>
			</div>
		</div>
	);

	if (showName) {
		return (
			<div className="columns is-centered">
				<div className="column is-6">{data}</div>
			</div>
		);
	} else {
		return data;
	}
}
