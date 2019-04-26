const refRate = 0.05;
const teamRate = 0.04;
const promoteRate = 0.02;
const minDeposit = 10;
const contractTeam = 'rioteam1a';
const contractPromote = 'rioteam1a';
const depositNum = 256;
const NS_PER_SECOND = 1000000000;
const MINUTE_PER_DAY = 24 * 60;
const NS_PER_MINUTE = NS_PER_SECOND * 60;
const REF_AMOUNT_KEY = 'refAmount:';
const REF_ALL_AMOUNT_KEY = 'refAllAmount:';
const SWITCH_KEY = 'SwitchKey';
const TIME_SWITCH_KEY = 'TimeSwitchKey';
const ACC_KEY_INDEX_KEY = 'AccKIndex:';
const ACC_FIELD_INDEX_KEY = 'AccFIndex:';
const ACC_EXISTS_KEY = 'EAcc:';
const tInterestRate = [
    0.036,
    0.046,
    0.056,
    0.066
];
const tInterestDay = [
    -1,
    45,
    25,
    18
];
class IostBank {
    init() {
    }
    _requireAuth(account, permission) {
        const ret = blockchain.requireAuth(account, permission);
        if (ret !== true) {
            throw new Error('require auth failed. ret = ' + ret);
        }
    }
    _storeAccInfo(account, nFieldIndex, obj) {
        storage.mapPut(account, this._normalizeFieldIndex(nFieldIndex), JSON.stringify(obj));
    }
    _findReffer(account, reffer) {
        if (storage.has(account)) {
            return storage.get(account);
        } else {
            return reffer;
        }
    }
    _normalizeFieldIndex(fieldIndex) {
        var type = typeof fieldIndex;
        if (type == 'number') {
            return fieldIndex.toFixed(0);
        } else {if (type == 'string') {
            return fieldIndex;
        }}
    }
    _getRealReffer(account, reffer) {
        reffer = this._findReffer(account, reffer);
        if ((reffer == '') || (reffer == account)) {
            reffer = contractPromote;
        }
        if (!storage.has(account)) {
            if (reffer != contractPromote) {
                storage.put(account, reffer);
            }
        }
        return reffer;
    }
    _findFieldIndex(account) {
        if (storage.mapLen(account) >= depositNum) {
            throw 'deposit record overflow. limit <= 256';
        }
        var tField = storage.mapKeys(account);
        var tFieldKeyFlag = [];
        for (var fieldKey in tField) {
            var realFieldKey = Number(fieldKey);
            tFieldKeyFlag[realFieldKey] = true;
        }
        var nFieldIndex = -1;
        for (var i = 0; i < depositNum; i++) {
            if (tFieldKeyFlag[i] != true) {
                nFieldIndex = i;
                break;
            }
        }
        if (nFieldIndex == -1)
            {throw 'algorithm error. nFieldIndex error';}
        return nFieldIndex;
    }
    _storeIncreaseInfo(key, step) {
        var bExists = storage.has(key);
        var strRefNum;
        if (bExists == false) {
            strRefNum = '' + step;
        } else {
            strRefNum = storage.get(key);
            var nRefNum = Number(strRefNum);
            if (isNaN(nRefNum)) {
                nRefNum = 0;
            }
            strRefNum = nRefNum + step;
        }
        storage.put(key, strRefNum);
    }
    _getIncreaseInfo(key) {
        var bExists = storage.has(key);
        var nNum = 0;
        if (bExists) {
            nNum = Number(storage.get(key));
        }
        return nNum;
    }
    _increaseRefNum(reffer, refAmount) {
        this._storeIncreaseInfo('Ref:' + reffer, 1);
        this._storeIncreaseInfo(REF_AMOUNT_KEY + reffer, refAmount);
    }
    _storeAcc(account) {
        var bExists = storage.has(ACC_EXISTS_KEY + account);
        if (bExists) {
            return;
        }
        var nKeyIndex = this._getIncreaseInfo(ACC_KEY_INDEX_KEY);
        var nFieldIndex = this._getIncreaseInfo(ACC_FIELD_INDEX_KEY);
        const MAX_KEY_INDEX = 100;
        if (nKeyIndex > MAX_KEY_INDEX) {
            return;
        }
        storage.mapPut(ACC_KEY_INDEX_KEY + nKeyIndex, this._normalizeFieldIndex(nFieldIndex), account);
        nFieldIndex++;
        if (nFieldIndex >= 255) {
            nKeyIndex++;
            nFieldIndex = 0;
        }
        storage.put(ACC_KEY_INDEX_KEY, nKeyIndex);
        storage.put(ACC_FIELD_INDEX_KEY, nFieldIndex);
        storage.put(ACC_EXISTS_KEY + account, '1');
    }
    getStoreAcc() {
        var nKeyIndex = this._getIncreaseInfo(ACC_KEY_INDEX_KEY);
        var nFieldIndex = this._getIncreaseInfo(ACC_FIELD_INDEX_KEY);
        var nAccNum = nKeyIndex * 255 + nFieldIndex;
        return {
            nKeyIndex,
            nFieldIndex,
            nAccNum
        };
    }
    deposit(account, amount, reffer, despositIndex) {
        var now = block.time;
        this._checkAllSwitch(now);
        var nAmount = Number(amount);
        if (isNaN(nAmount)) {
            throw 'amount is not number';
        }
        if (nAmount < minDeposit) {
            throw 'amount is less than ' + minDeposit;
        }
        amount = nAmount.toFixed(4);
        if ((despositIndex < 0) || (despositIndex > 3)) {
            throw 'despositIndex index error. index=>' + despositIndex;
        }
        reffer = this._getRealReffer(account, reffer);
        blockchain.call('token.iost', 'transfer', [
            'iost',
            account,
            blockchain.contractName(),
            amount,
            'BankDeposit|'+ reffer
        ]);
        var nFieldIndex = this._findFieldIndex(account);
        var interestRate = tInterestRate[despositIndex];
        var interestDay = tInterestDay[despositIndex];
        var obj = {
            reffer: reffer,
            deposit: nAmount,
            depositTime: now,
            interestTime: now,
            balance: 0,
            interestRate: interestRate,
            interestDay: interestDay
        };
        this._storeAccInfo(account, nFieldIndex, obj);
        var nRewardBalance;
        nRewardBalance = (Number(amount) * refRate).toFixed(4);
        blockchain.callWithAuth('token.iost', 'transfer', [
            'iost',
            blockchain.contractName(),
            reffer,
            nRewardBalance,
            'BankDeposit|reward for inviting'
        ]);
        this._increaseRefNum(reffer, Number(nRewardBalance));
        this._storeIncreaseInfo(REF_ALL_AMOUNT_KEY, Number(nRewardBalance));
        nRewardBalance = (Number(amount) * teamRate).toFixed(4);
        blockchain.callWithAuth('token.iost', 'transfer', [
            'iost',
            blockchain.contractName(),
            contractTeam,
            nRewardBalance,
            'BankDeposit|reward for developer'
        ]);
        nRewardBalance = (Number(amount) * promoteRate).toFixed(4);
        blockchain.callWithAuth('token.iost', 'transfer', [
            'iost',
            blockchain.contractName(),
            contractPromote,
            nRewardBalance,
            'BankDeposit|reward for promotion'
        ]);
        this._storeAcc(account);
        return 'IostBank.deposit success';
    }
    _checkInterest(account, now) {
        var tField = storage.mapKeys(account);
        var totalInterest = 0;
        var amountOwner = this._getContractBalance();
        for (var fieldKey in tField) {
            var obj = JSON.parse(storage.mapGet(account, fieldKey));
            var bRemove4Db = false;
            var deposit = obj.deposit;
            var endPoint = now;
            if (obj.interestDay != -1) {
                endPoint = obj.depositTime + (obj.interestDay * MINUTE_PER_DAY * NS_PER_MINUTE);
                if (now >= endPoint) {
                    bRemove4Db = true;
                } else {
                    endPoint = now;
                }
            }
            var durMin = Math.floor((endPoint - obj.interestTime) / NS_PER_MINUTE);
            var durDay = Math.floor(durMin / MINUTE_PER_DAY);
            var durMinRemain = durMin - durDay * MINUTE_PER_DAY;
            var interest = 0;
            if (durDay > 0)
                {interest = interest + Number((deposit * obj.interestRate * durDay).toFixed(4));}
            interest = interest + Number(((deposit * obj.interestRate) * durMinRemain / MINUTE_PER_DAY).toFixed(4));
            var balance = (interest > amountOwner) ? (amountOwner) : (interest);
            amountOwner = amountOwner - balance;
            if (balance > 0)
                {obj.balance = obj.balance + balance;}
            obj.interestTime = now;
            storage.mapPut(account, this._normalizeFieldIndex(fieldKey), JSON.stringify(obj));
            totalInterest = totalInterest + interest;
        }
        if (totalInterest <= 0) {
            throw 'BankDeposit|checkInterest totalInterest is not enough';
        }
        return totalInterest;
    }
    _getContractBalance() {
        var amountOwner = blockchain.call('token.iost', 'balanceOf', [
            'iost',
            blockchain.contractName()
        ]);
        return Number(amountOwner);
    }
    withdraw(account) {
        var now = block.time;
        this._checkAllSwitch(now);
        var nWithdraw = this._checkInterest(account, now);
        var amountOwner = this._getContractBalance();
        if (amountOwner <= nWithdraw) {
            nWithdraw = amountOwner;
            this._setSwitch(false);
        }
        blockchain.callWithAuth('token.iost', 'transfer', [
            'iost',
            blockchain.contractName(),
            account,
            nWithdraw.toFixed(4),
            'BankDeposit|withdraw'
        ]);
        return 'IostBank.withDraw success';
    }
    _delAcc(account) {
        var tField = storage.mapKeys(account);
        for (var fieldKey in tField) {
            storage.mapDel(account, fieldKey);
        }
        if (storage.has('Ref:' + account))
            {storage.del('Ref:' + account);}
        if (storage.has(REF_AMOUNT_KEY + account))
            {storage.del(REF_AMOUNT_KEY + account);}
        if (storage.has(account))
            {storage.del(account);}
        if (storage.has(ACC_EXISTS_KEY + account))
            {storage.del(ACC_EXISTS_KEY + account);}
    }
    delAcc(account) {
        this._requireAuth(blockchain.contractOwner(), 'active');
        this._delAcc(account);
    }
    getAccList(nStartIndex, nEndIndex) {
        this._requireAuth(blockchain.contractOwner(), 'active');
        return this._getAccList(nStartIndex, nEndIndex);
    }
    _getAccList(nStartIndex, nEndIndex) {
        if (nStartIndex < 0 || nStartIndex >= 100)
            {throw 'nStartIndex must between 0 and 99';}
        if (nEndIndex < 0 || nEndIndex >= 100)
            {throw 'nEndIndex must between 0 and 99';}
        var tAcc = [];
        for (var nKeyIndex = nStartIndex; nKeyIndex <= nEndIndex; nKeyIndex++) {
            var key = ACC_KEY_INDEX_KEY + nKeyIndex;
            var tField = storage.mapKeys(key);
            if (tField != null) {
                for (var fieldKey in tField) {
                    var strAcc = storage.mapGet(key, fieldKey);
                    if ((strAcc != null) && (strAcc != ''))
                        {tAcc.push(strAcc);}
                }
            }
        }
        return tAcc;
    }
    clearAcc() {
        this._requireAuth(blockchain.contractOwner(), 'active');
        var tAcc = this.getAccList(0, 99);
        if (tAcc.length == 0)
            {throw 'tAcc=>[]';}
        var self = this;
        tAcc.forEach(account => {
            self._delAcc(account);
        });
        storage.del(ACC_KEY_INDEX_KEY);
        storage.del(ACC_FIELD_INDEX_KEY);
        storage.del(REF_ALL_AMOUNT_KEY);
    }
    clearBalance(balance, account) {
        this._requireAuth(blockchain.contractOwner(), 'active');
        if (balance < 0)
            {throw 'require balance >= 0';}
        var amountOwner = blockchain.call('token.iost', 'balanceOf', [
            'iost',
            blockchain.contractName()
        ]);
        if (balance > 0) {
            if (balance > amountOwner) {
                throw 'balance must be 0 or <= amountOwner';
            }
        } else {
            balance = amountOwner;
        }
        blockchain.callWithAuth('token.iost', 'transfer', [
            'iost',
            blockchain.contractName(),
            account,
            balance,
            'BankDeposit|clearBalance'
        ]);
    }
    _setSwitch(bSwitch) {
        storage.put(SWITCH_KEY, bSwitch);
    }
    setSwitch(bSwitch) {
        this._requireAuth(blockchain.contractOwner(), 'active');
        this._setSwitch(bSwitch);
    }
    _getSwitch4Db() {
        var bSwitch = false;
        if (storage.has(SWITCH_KEY)) {
            if (storage.get(SWITCH_KEY) == true) {
                bSwitch = true;
            }
        }
        return bSwitch;
    }
    setTimeSwitch(nTimeSwitch) {
        this._requireAuth(blockchain.contractOwner(), 'active');
        var now = block.time;
        now += (NS_PER_SECOND * nTimeSwitch);
        storage.put(TIME_SWITCH_KEY, now);
    }
    checkAllSwitch() {
        this._checkAllSwitch(block.time);
    }
    _checkAllSwitch(now) {
        if (this._getSwitch4Db() == false) {
            throw 'switch is off. 总开关处于关闭状态';
        }
        if (storage.has(TIME_SWITCH_KEY)) {
            var nTimeSwitch = Number(storage.get(TIME_SWITCH_KEY));
            if (nTimeSwitch > now) {
                throw 'timeswitch is not deadline. 时间开关未开启 timeswitch=>'+ nTimeSwitch + ' now=>' + now;
            }
        } else {
            throw 'timeswitch is not deadline. 时间开关未存储';
        }
    }
    getSwitch() {
        this._requireAuth(blockchain.contractOwner(), 'active');
        var now = block.time;
        var bSwitch = this._getSwitch4Db();
        var nTimeSwitch = 0;
        var nTimeDiff = 0;
        if (storage.has(TIME_SWITCH_KEY)) {
            nTimeSwitch = Number(storage.get(TIME_SWITCH_KEY));
            nTimeDiff = Math.floor((nTimeSwitch - now) / NS_PER_SECOND));
        }
        return {
            bSwitch,
            nTimeSwitch,
            now,
            nTimeDiff
        };
    }
    delMyKey(key) {
        this._requireAuth(blockchain.contractOwner(), 'active');
        storage.del(key);
    }
    can_update(data) {
        return blockchain.requireAuth(blockchain.contractOwner(), 'active');
    }
}
module.exports = IostBank;
