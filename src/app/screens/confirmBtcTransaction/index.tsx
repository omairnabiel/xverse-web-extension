import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { BtcTransactionBroadcastResponse } from '@secretkeylabs/xverse-core/types';
import BottomBar from '@components/tabBar';
import useBtcWalletData from '@hooks/queries/useBtcWalletData';
import useWalletSelector from '@hooks/useWalletSelector';
import ConfirmBtcTransactionComponent from '@components/confirmBtcTransactionComponent';
import styled from 'styled-components';
import { saveTimeForNonOrdinalTransferTransaction } from '@utils/localStorage';
import InfoContainer from '@components/infoContainer';
import { useTranslation } from 'react-i18next';
import useOrdinalsByAddress from '@hooks/useOrdinalsByAddress';
import useNonOrdinalUtxos from '@hooks/useNonOrdinalUtxo';
import AlertMessage from '@components/alertMessage';
import { Recipient } from '@secretkeylabs/xverse-core/transactions/btc';
import useBtcClient from '@hooks/useBtcClient';

const BottomBarContainer = styled.h1((props) => ({
  marginTop: props.theme.spacing(5),
}));

function ConfirmBtcTransaction() {
  const navigate = useNavigate();
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });
  const { network, ordinalsAddress, btcAddress } = useWalletSelector();
  const btcClient = useBtcClient();
  const [recipientAddress, setRecipientAddress] = useState('');
  const [signedTx, setSignedTx] = useState<string>('');
  const [showOrdinalsDetectedAlert, setShowOrdinalsDetectedAlert] = useState(false);
  const location = useLocation();
  const { refetch } = useBtcWalletData();
  const {
    ordinals: ordinalsInBtc,
  } = useOrdinalsByAddress(btcAddress);
  const { unspentUtxos: withdrawOridnalsUtxos } = useNonOrdinalUtxos();
  const {
    fee, amount, signedTxHex, recipient, isRestoreFundFlow, unspentUtxos,
  } = location.state;

  const {
    isLoading,
    error: txError,
    data: btcTxBroadcastData,
    mutate,
  } = useMutation<BtcTransactionBroadcastResponse, Error, { signedTx: string }>(
    async ({ signedTx }) => btcClient.sendRawTransaction(signedTx),
  );

  const {
    error: errorBtcOrdinalTransaction,
    data: btcOrdinalTxBroadcastData,
    mutate: broadcastOrdinalTransaction,
} = useMutation<BtcTransactionBroadcastResponse, Error, { signedTx: string }>(
  async ({ signedTx }) => btcClient.sendRawTransaction(signedTx),
);
  const onClick = () => {
    navigate('/recover-ordinals');
  };

  const onContinueButtonClick = () => {
    mutate({ signedTx });
  };

  useEffect(() => {
    if (errorBtcOrdinalTransaction) {
      navigate('/tx-status', {
        state: {
          txid: '',
          currency: 'BTC',
          isNft: true,
          error: errorBtcOrdinalTransaction.toString(),
        },
      });
    }
  }, [errorBtcOrdinalTransaction]);

  useEffect(() => {
    setRecipientAddress(location.state.recipientAddress);
  }, [location]);

  useEffect(() => {
    if (btcTxBroadcastData) {
      navigate('/tx-status', {
        state: {
          txid: btcTxBroadcastData.tx.hash,
          currency: 'BTC',
          error: '',
        },
      });
      setTimeout(() => {
        refetch();
      }, 1000);
    }
  }, [btcTxBroadcastData]);

  useEffect(() => {
    if (btcOrdinalTxBroadcastData) {
      saveTimeForNonOrdinalTransferTransaction(ordinalsAddress).then(() => {
        navigate('/tx-status', {
          state: {
            txid: btcOrdinalTxBroadcastData.tx.hash,
            currency: 'BTC',
            isNft: true,
            error: '',
          },
        });
        setTimeout(() => {
          refetch();
        }, 1000);
      });
    }
  }, [btcOrdinalTxBroadcastData]);

  useEffect(() => {
    if (txError) {
      navigate('/tx-status', {
        state: {
          txid: '',
          currency: 'BTC',
          error: txError.toString(),
        },
      });
    }
  }, [txError]);

  const handleOnConfirmClick = (txHex: string) => {
    if (isRestoreFundFlow) {
      broadcastOrdinalTransaction({ signedTx: txHex });
    } else if (ordinalsInBtc && ordinalsInBtc.length > 0) {
      setSignedTx(txHex);
      setShowOrdinalsDetectedAlert(true);
    } else mutate({ signedTx: txHex });
  };

  const goBackToScreen = () => {
    if (isRestoreFundFlow) {
      navigate(-1);
    } else {
      navigate('/send-btc', {
        state: {
          amount,
          recipientAddress,
        },
      });
    }
  };

  const onClosePress = () => {
    setShowOrdinalsDetectedAlert(false);
  };

  return (
    <>
      {showOrdinalsDetectedAlert && (
        <AlertMessage
          title={t('BTC_TRANSFER_DANGER_ALERT_TITLE')}
          description={t('BTC_TRANSFER_DANGER_ALERT_DESC')}
          buttonText={t('BACK')}
          onClose={onClosePress}
          secondButtonText={t('CONITNUE')}
          onButtonClick={onClosePress}
          onSecondButtonClick={onContinueButtonClick}
          isWarningAlert
        />
      )}

      <ConfirmBtcTransactionComponent
        fee={fee}
        recipients={recipient as Recipient[]}
        loadingBroadcastedTx={isLoading}
        signedTxHex={signedTxHex}
        isRestoreFundFlow={isRestoreFundFlow}
        onConfirmClick={handleOnConfirmClick}
        onCancelClick={goBackToScreen}
        onBackButtonClick={goBackToScreen}
        nonOrdinalUtxos={unspentUtxos}
        amount={amount}
      >
        {ordinalsInBtc && ordinalsInBtc.length > 0 && (
        <InfoContainer
          type="Warning"
          showWarningBackground
          bodyText={t('ORDINAL_DETECTED_WARNING')}
          redirectText={t('ORDINAL_DETECTED_ACTION')}
          onClick={onClick}
        />
        )}
      </ConfirmBtcTransactionComponent>
      <BottomBarContainer>
        <BottomBar tab="dashboard" />
      </BottomBarContainer>
    </>
  );
}

export default ConfirmBtcTransaction;
