import SwapImage from '@assets/img/webInteractions/swapCall.svg';
import BNSImage from '@assets/img/webInteractions/bnsCall.svg';
import NFTImage from '@assets/img/webInteractions/nftCall.svg';
import ContractCall from '@assets/img/webInteractions/contractCall.svg';
import { ContractCallPayload } from '@stacks/connect';
import styled from 'styled-components';
import ConfirmStxTransationComponent from '@components/confirmStxTransactionComponent';
import StxPostConditionCard from '@components/postCondition/stxPostConditionCard';
import { createContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ClarityType,
  cvToJSON,
  cvToString,
  PostConditionType,
  SomeCV,
  StacksTransaction,
} from '@stacks/transactions';
import {
  addressToString,
  broadcastSignedTransaction,
  Coin,
  extractFromPayload,
} from '@secretkeylabs/xverse-core';
import { useNavigate } from 'react-router-dom';
import { Args, ContractFunction } from '@secretkeylabs/xverse-core/types/api/stacks/transaction';
import FtPostConditionCard from '@components/postCondition/ftPostConditionCard';
import NftPostConditionCard from '@components/postCondition/nftPostConditionCard';
import AccountHeaderComponent from '@components/accountHeader';
import useOnOriginTabClose from '@hooks/useOnTabClosed';
import InfoContainer from '@components/infoContainer';
import useNetworkSelector from '@hooks/useNetwork';
import TransactionDetailComponent from '@components/transactionDetailComponent';
import finalizeTxSignature from './utils';

const PostConditionContainer = styled.div((props) => ({
  display: 'flex',
  paddingTop: props.theme.spacing(12),
  paddingBottom: props.theme.spacing(12),
  borderTop: `0.5px solid ${props.theme.colors.background.elevation3}`,
  borderBottom: `0.5px solid ${props.theme.colors.background.elevation3}`,
  flexDirection: 'column',
}));
const SponsoredContainer = styled.div({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});
const SponsoredTag = styled.div((props) => ({
  background: props.theme.colors.background.elevation3,
  marginTop: props.theme.spacing(7.5),
  paddingTop: props.theme.spacing(4),
  paddingBottom: props.theme.spacing(4),
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
  borderRadius: 30,
}));
const SponosredText = styled.h1((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white['0'],
}));
const PostConditionAlertText = styled.h1((props) => ({
  ...props.theme.body_l,
  color: props.theme.colors.white['0'],
}));

const TopImage = styled.img({
  width: 88,
  height: 88,
});

const FunctionTitle = styled.h1((props) => ({
  ...props.theme.headline_s,
  color: props.theme.colors.white['0'],
  marginTop: 16,
}));

const Line = styled.div((props) => ({
  position: 'absolute',
  width: '100%',
  border: `0.5px solid ${props.theme.colors.background.elevation3}`,
  marginTop: props.theme.spacing(8),
}));

const ButtonContainer = styled.div({
  position: 'absolute',
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

const ShowMoreButton = styled.button((props) => ({
  position: 'relative',
  paddingLeft: props.theme.spacing(4),
  paddingRight: props.theme.spacing(4),
  paddingTop: props.theme.spacing(2),
  paddingBottom: props.theme.spacing(2),
  backgroundColor: '#12151E',
  borderRadius: 24,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'row',
  border: `1px solid ${props.theme.colors.background.elevation3}`,
}));

const ShowMoreButtonContainer = styled.div((props) => ({
  position: 'relative',
  width: '100%',
  marginTop: props.theme.spacing(12),
  marginBottom: props.theme.spacing(12),
}));

const DappTitle = styled.h2((props) => ({
  ...props.theme.body_l,
  color: props.theme.colors.white['400'],
  marginTop: 4,
}));

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: props.theme.spacing(12),
}));

const ButtonText = styled.div((props) => ({
  ...props.theme.body_xs,
  fontWeight: 700,
  marginLeft: props.theme.spacing(2),
  color: props.theme.colors.white['0'],
  textAlign: 'center',
}));

const ButtonSymbolText = styled.div((props) => ({
  ...props.theme.body_xs,
  marginLeft: props.theme.spacing(2),
  color: props.theme.colors.white['0'],
  textAlign: 'center',
  fontSize: 20,
}));

const headerImageMapping = {
  'purchase-asset': NFTImage,
  'buy-item': NFTImage,
  'buy-in-ustx': NFTImage,
  'name-preorder': BNSImage,
  'swap-x-for-y': SwapImage,
  'swap-helper': SwapImage,
};

interface ContractCallRequestProps {
  request: ContractCallPayload;
  unsignedTx: StacksTransaction;
  funcMetaData: ContractFunction | undefined;
  coinsMetaData: Coin[] | null;
  tabId: number;
  requestToken: string;
  attachment: Buffer | undefined;
}

export const ShowMoreContext = createContext({ showMore: false });

export default function ContractCallRequest(props: ContractCallRequestProps) {
  const {
    request, unsignedTx, funcMetaData, coinsMetaData, tabId, requestToken, attachment,
  } = props;
  const selectedNetwork = useNetworkSelector();
  const [hasTabClosed, setHasTabClosed] = useState(false);
  const { t } = useTranslation('translation');
  const [isShowMore, setIsShowMore] = useState(false);

  useOnOriginTabClose(
    tabId,
    () => {
      setHasTabClosed(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
  );

  const showMoreButton = (
    <ShowMoreButtonContainer>
      <Line />
      <ButtonContainer>
        <ShowMoreButton onClick={() => setIsShowMore(!isShowMore)}>
          <ButtonText>{isShowMore ? t('CONTRACT_CALL_REQUEST.SHOW_LESS') : t('CONTRACT_CALL_REQUEST.SHOW_MORE')}</ButtonText>
          <ButtonSymbolText>{isShowMore ? t('CONTRACT_CALL_REQUEST.MINUS') : t('CONTRACT_CALL_REQUEST.PLUS')}</ButtonSymbolText>
        </ShowMoreButton>
      </ButtonContainer>
    </ShowMoreButtonContainer>
  );

  type ArgToView = { name: string; value: string; type: any };
  const getFunctionArgs = (): Array<ArgToView> => {
    const args: Array<ArgToView> = [];
    const { funcArgs } = extractFromPayload(request);
    funcMetaData?.args?.map((arg: Args, index: number) => {
      const funcArg = cvToJSON(funcArgs[index]);

      const argTypeIsOptionalSome = funcArgs[index].type === ClarityType.OptionalSome;

      const funcArgType = argTypeIsOptionalSome
        ? (funcArgs[index] as SomeCV).value?.type
        : funcArgs[index]?.type;

      const funcArgValString = argTypeIsOptionalSome
        ? cvToString((funcArgs[index] as SomeCV).value, 'tryAscii')
        : cvToString(funcArgs[index]);

      const normalizedValue = (() => {
        switch (funcArgType) {
          case ClarityType.UInt:
            return funcArgValString.split('u').join('');
          case ClarityType.Buffer:
            return funcArgValString.substring(1, funcArgValString.length - 1);
          default:
            return funcArgValString;
        }
      })();
      const argToView: ArgToView = {
        name: arg.name,
        value: normalizedValue,
        type: funcArg.type,
      };
      args.push(argToView);
    });
    return args;
  };

  const truncateFunctionArgsView = (value: string) => `${value.substring(0, 12)}...${value.substring(
    value.length - 12,
    value.length,
  )}`;

  const functionArgsView = () => {
    const args = getFunctionArgs();
    return args.map((arg, index) => (
      <TransactionDetailComponent title={arg.name} value={arg.value.length > 20 ? truncateFunctionArgsView(arg.value) : arg.value} description={arg.type} />
    ));
  };

  const showSponsoredTransactionTag = (
    <SponsoredContainer>
      <SponsoredTag>
        <SponosredText>{t('CONTRACT_CALL_REQUEST.SPONSORED')}</SponosredText>
      </SponsoredTag>
    </SponsoredContainer>
  );

  const postConditionAlert = unsignedTx?.postConditionMode === 2
    && unsignedTx?.postConditions.values.length <= 0 && (
      <PostConditionContainer>
        <PostConditionAlertText>{t('CONTRACT_CALL_REQUEST.POST_CONDITION_ALERT')}</PostConditionAlertText>
      </PostConditionContainer>
  );
  const navigate = useNavigate();
  const broadcastTx = async (tx: StacksTransaction[], txAttachment: Buffer | undefined = undefined) => {
    try {
      const broadcastResult: string = await broadcastSignedTransaction(tx[0], selectedNetwork, txAttachment);
      if (broadcastResult) {
        finalizeTxSignature({ requestPayload: requestToken, tabId, data: { txId: broadcastResult, txRaw: tx[0].serialize().toString('hex') } });
        navigate('/tx-status', {
          state: {
            txid: broadcastResult,
            currency: 'STX',
            error: '',
            browserTx: true,
          },
        });
      }
    } catch (e) {
      if (e instanceof Error) {
        navigate('/tx-status', {
          state: {
            txid: '',
            currency: 'STX',
            error: e.message,
            browserTx: true,
          },
        });
      }
    }
  };

  const confirmCallback = (transactions: StacksTransaction[]) => {
    if (request?.sponsored) {
      navigate('/tx-status', {
        state: {
          sponsored: true,
          browserTx: true,
        },
      });
    } else {
      broadcastTx(transactions, attachment);
    }
  };
  const cancelCallback = () => {
    finalizeTxSignature({ requestPayload: requestToken, tabId, data: 'cancel' });
    window.close();
  };

  const renderPostConditionsCard = () => {
    const { postConds } = extractFromPayload(request);
    return postConds?.map((postCondition, i) => {
      switch (postCondition.conditionType) {
        case PostConditionType.STX:
          return <StxPostConditionCard key={i} postCondition={postCondition} />;
        case PostConditionType.Fungible:
          const coinInfo = coinsMetaData?.find(
            (coin: Coin) => coin.contract
              === `${addressToString(postCondition.assetInfo.address)}.${
                postCondition.assetInfo.contractName.content
              }`,
          );
          return (
            <FtPostConditionCard key={i} postCondition={postCondition} ftMetaData={coinInfo} />
          );
        case PostConditionType.NonFungible:
          return <NftPostConditionCard key={i} postCondition={postCondition} />;
        default:
          return '';
      }
    });
  };

  return (
    <>
      <AccountHeaderComponent disableMenuOption disableAccountSwitch />
      <ConfirmStxTransationComponent
        initialStxTransactions={[unsignedTx]}
        onConfirmClick={confirmCallback}
        onCancelClick={cancelCallback}
        loading={false}
        title={request.functionName}
        subTitle={`Requested by ${request.appDetails?.name}`}
      >
        <>
          {hasTabClosed && <InfoContainer titleText={t('WINDOW_CLOSED_ALERT.TITLE')} bodyText={t('WINDOW_CLOSED_ALERT.BODY')} />}
          {postConditionAlert}
          {request.sponsored && showSponsoredTransactionTag}
          {renderPostConditionsCard()}
          <TransactionDetailComponent title={t('CONTRACT_CALL_REQUEST.FUNCTION')} value={request?.functionName} />
          {functionArgsView()}
        </>
      </ConfirmStxTransationComponent>
    </>
  );
}
