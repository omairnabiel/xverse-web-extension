import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { ReactNode, useEffect, useState } from 'react';
import BigNumber from 'bignumber.js';
import ActionButton from '@components/button';
import SettingIcon from '@assets/img/dashboard/faders_horizontal.svg';
import TransactionSettingAlert from '@components/transactionSetting';
import { microstacksToStx, stxToMicrostacks } from '@secretkeylabs/xverse-core/currency';
import { StacksTransaction } from '@secretkeylabs/xverse-core/types';
import TransferFeeView from '@components/transferFeeView';
import {
  setFee,
  setNonce,
  getNonce,
  signMultiStxTransactions,
  signTransaction,
} from '@secretkeylabs/xverse-core';
import useWalletSelector from '@hooks/useWalletSelector';
import useNetworkSelector from '@hooks/useNetwork';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  margin-top: 22px;
  margin-left: 16px;
  margin-right: 16px;
  overflow-y: auto;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const ButtonContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  marginBottom: props.theme.spacing(12),
  marginTop: props.theme.spacing(12),
  marginLeft: props.theme.spacing(8),
  marginRight: props.theme.spacing(8),
}));

const TransparentButtonContainer = styled.div((props) => ({
  marginLeft: props.theme.spacing(2),
  marginRight: props.theme.spacing(2),
  width: '100%',
}));

const Button = styled.button((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  borderRadius: props.theme.radius(1),
  backgroundColor: 'transparent',
  width: '100%',
  marginTop: props.theme.spacing(10),
}));

const ButtonText = styled.div((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white['0'],
  textAlign: 'center',
}));

const ButtonImage = styled.img((props) => ({
  marginRight: props.theme.spacing(3),
  alignSelf: 'center',
  transform: 'all',
}));

const SponsoredInfoText = styled.h1((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white['400'],
}));

const ReviewTransactionText = styled.h1((props) => ({
  ...props.theme.headline_s,
  color: props.theme.colors.white[0],
  textAlign: 'left',
}));

const RequestedByText = styled.h1((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white[400],
  marginTop: props.theme.spacing(4),
  textAlign: 'left',
}));

const TitleContainer = styled.div((props) => ({
  marginBottom: props.theme.spacing(16),
}));

interface Props {
  initialStxTransactions: StacksTransaction[];
  loading: boolean;
  onCancelClick: () => void;
  onConfirmClick: (transactions: StacksTransaction[]) => void;
  children: ReactNode;
  isSponsored?: boolean;
  isAsset?: boolean;
  title?: string;
  subTitle?: string;

}

function ConfirmStxTransationComponent({
  initialStxTransactions,
  loading,
  isSponsored,
  children,
  isAsset,
  title,
  subTitle,
  onConfirmClick,
  onCancelClick,
}: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });
  const selectedNetwork = useNetworkSelector();
  const { selectedAccount, seedPhrase } = useWalletSelector();
  const [openTransactionSettingModal, setOpenTransactionSettingModal] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(loading);

  useEffect(() => {
    setButtonLoading(loading);
  }, [loading]);

  const getFee = () => (isSponsored
    ? new BigNumber(0)
    : new BigNumber(
      initialStxTransactions
        .map((tx) => tx?.auth?.spendingCondition?.fee ?? BigInt(0))
        .reduce((prev, curr) => prev + curr, BigInt(0))
        .toString(10),
    ));

  const getTxNonce = (): string => {
    const nonce = getNonce(initialStxTransactions[0]);
    return nonce.toString();
  };

  const onAdvancedSettingClick = () => {
    setOpenTransactionSettingModal(true);
  };

  const closeTransactionSettingAlert = () => {
    setOpenTransactionSettingModal(false);
  };

  const onConfirmButtonClick = async () => {
    let signedTxs: StacksTransaction[] = [];
    if (initialStxTransactions.length === 1) {
      const signedContractCall = await signTransaction(
        initialStxTransactions[0],
        seedPhrase,
        selectedAccount?.id ?? 0,
        selectedNetwork,
      );
      signedTxs.push(signedContractCall);
    } else if (initialStxTransactions.length === 2) {
      signedTxs = await signMultiStxTransactions(
        initialStxTransactions,
        selectedAccount?.id ?? 0,
        selectedNetwork,
        seedPhrase,
      );
    }
    onConfirmClick(signedTxs);
  };

  const applyTxSettings = (settingFee: string, nonce?: string) => {
    const fee = stxToMicrostacks(new BigNumber(settingFee));
    setFee(initialStxTransactions[0], BigInt(fee.toString()));
    if (nonce && nonce !== '') {
      setNonce(initialStxTransactions[0], BigInt(nonce));
    }
    setOpenTransactionSettingModal(false);
  };

  return (
    <>
      <Container>
        <TitleContainer>
          {!isAsset && <ReviewTransactionText>{title ?? t('REVIEW_TRNSACTION')}</ReviewTransactionText>}
          {subTitle && <RequestedByText>{subTitle}</RequestedByText>}
        </TitleContainer>
        {children}
        <TransferFeeView fee={microstacksToStx(getFee())} currency="STX" />
        {initialStxTransactions[0]?.payload?.amount && (
          <TransferFeeView
            fee={microstacksToStx(
              getFee().plus(new BigNumber(initialStxTransactions[0]?.payload.amount?.toString(10))),
            )}
            currency="STX"
            title={t('TOTAL')}
          />
        )}
        {!isSponsored && (
          <Button onClick={onAdvancedSettingClick}>
            <>
              <ButtonImage src={SettingIcon} />
              <ButtonText>{t('ADVANCED_SETTING')}</ButtonText>
            </>
          </Button>
        )}
        {isSponsored && <SponsoredInfoText>{t('SPONSORED_TX_INFO')}</SponsoredInfoText>}
        <TransactionSettingAlert
          visible={openTransactionSettingModal}
          fee={microstacksToStx(getFee()).toString()}
          type="STX"
          nonce={getTxNonce()}
          onApplyClick={applyTxSettings}
          onCrossClick={closeTransactionSettingAlert}
        />
      </Container>
      <ButtonContainer>
        <TransparentButtonContainer>
          <ActionButton
            text={t('CANCEL')}
            transparent
            disabled={buttonLoading}
            onPress={onCancelClick}
          />
        </TransparentButtonContainer>
        <ActionButton
          text={t('CONFIRM')}
          disabled={buttonLoading}
          processing={buttonLoading}
          onPress={onConfirmButtonClick}
        />
      </ButtonContainer>
    </>
  );
}

export default ConfirmStxTransationComponent;
