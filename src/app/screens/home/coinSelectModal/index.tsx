import BottomModal from '@components/bottomModal';
import TokenTile from '@components/tokenTile';
import { FungibleToken } from '@secretkeylabs/xverse-core/types';
import IconBitcoin from '@assets/img/dashboard/bitcoin_icon.svg';
import IconStacks from '@assets/img/dashboard/stack_icon.svg';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components';

const Container = styled.div((props) => ({
  marginTop: props.theme.spacing(6),
  marginBottom: props.theme.spacing(20),
}));

interface Props {
  visible: boolean;
  coins: FungibleToken[];
  title: string;
  onSelectBitcoin: () => void;
  onSelectStacks: () => void;
  onSelectCoin: (coin: FungibleToken) => void;
  onClose: () => void;
  loadingWalletData: boolean;
}

function CoinSelectModal({
  visible,
  coins,
  title,
  onSelectBitcoin,
  onSelectStacks,
  onSelectCoin,
  onClose,
  loadingWalletData,
}: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'DASHBOARD_SCREEN' });
  const theme = useTheme();

  const handleOnBitcoinPress = () => {
    onSelectBitcoin();
    onClose();
  };

  const handleOnStackPress = () => {
    onSelectStacks();
    onClose();
  };

  function renderFixedCoins() {
    return (
      <>
        <TokenTile
          title={t('BITCOIN')}
          currency="BTC"
          icon={IconBitcoin}
          loading={loadingWalletData}
          underlayColor={theme.colors.background.elevation2}
          margin={14}
          enlargeTicker
          onPress={handleOnBitcoinPress}
        />

        <TokenTile
          title={t('STACKS')}
          currency="STX"
          icon={IconStacks}
          loading={loadingWalletData}
          underlayColor={theme.colors.background.elevation2}
          margin={14}
          enlargeTicker
          onPress={handleOnStackPress}
        />
      </>
    );
  }

  function renderToken() {
    return (
      <Container>
        {renderFixedCoins()}
        {coins.map((coin) => (
          <TokenTile
            key={coin.principal}
            title={coin.name}
            currency="FT"
            icon={IconStacks}
            loading={loadingWalletData}
            underlayColor={theme.colors.background.elevation2}
            margin={14}
            enlargeTicker
            onPress={() => {
              onSelectCoin(coin);
              onClose();
            }}
            fungibleToken={coin}
          />
        ))}
      </Container>
    );
  }
  return (
    <BottomModal visible={visible} header={title} onClose={onClose}>
      {renderToken()}
    </BottomModal>
  );
}

export default CoinSelectModal;
