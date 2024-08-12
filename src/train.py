import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
from collections import OrderedDict, defaultdict
import numpy as np
from sklearn.preprocessing import OneHotEncoder
from sklearn.neighbors import KernelDensity
import lightgbm as lgb
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
from sklearn.model_selection import train_test_split, KFold
from pprint import pprint
import pandas as pd
import re

from config import Config
import logUtils, logging


L = logUtils.createLogger(__name__, log_level=logging.DEBUG)

class Train:

    SAMPLING_POINTS = [30, 60, 90, 120, 150, 180]
    
    def __init__(self):
        self.modes = Config.VALID_RUNNING_MODES
        self.data = defaultdict(lambda : {'features': defaultdict(lambda:0), 'label': -1})
        self.packageNameCount = defaultdict(lambda : 0)
        self.count = None
        
    def countPackageNames(self, target, modes):
        self.count = len(modes)
        for mode in modes:
            logFilePaths = list(
                Config(target, mode)
                .targetModeLogsDir
                .glob('*.txt')
            )
            for logFilePath in logFilePaths:
                packageName = logFilePath.stem
                self.packageNameCount[packageName] += 1

    def clean_feature_names(self, df):
        cleaned_columns = [re.sub(r'\W+', '_', col) for col in df.columns]
        df.columns = cleaned_columns
        return df
    
    def prepareData(self, target, modes, label):
        self.countPackageNames(target, ['DirectTesting', 'AntiTimebomb'])
        for mode in modes:
            logFilePaths = list(
                Config(target, mode)
                .targetModeLogsDir
                .glob('*.txt')
            )
            for logFilePath in logFilePaths:
                self._processLogFile(logFilePath, label)

    def _processLogFile(self, logFilePath, label):
        hit_SAMPLING_POINTS = 0
        packageName = logFilePath.stem
        if self.packageNameCount[packageName] != self.count:
            return
        with open(logFilePath, "r") as file:
            for line in file:
                if line.startswith("!!!"): # !!! 180 seconds 1844 974
                    hit_SAMPLING_POINTS += 1
                    lineList = line.split()
                    seconds = int(lineList[1])
                    total = int(lineList[3])
                    unique = int(lineList[4])
                    if seconds == 30:
                        break
                    #     L.debug(f"{logFilePath} {mode} {total} {unique}")
                if line.startswith("+++") or line.startswith("---"):
                    api = line[line.find("=== ")+4:line.find("\n")]
                    self.data[packageName]['features'][api] += 1
        self.data[packageName]['label'] = label
        # if hit_SAMPLING_POINTS != len(self.SAMPLING_POINTS):
        #     L.critical(f"{hit_SAMPLING_POINTS} {logFilePath}")
            # exit()
    
    def train(self):

        # Extract data into a list of dictionaries
        data_list = []
        labelCount = {
            0: 0,
            1: 0
        }
        labelMax = {
            0: 300,
            1: 300
        }
        for packageName in self.data:
            label = self.data[packageName]['label']
            if labelCount[label] == labelMax[label]:
                continue
            labelCount[label] += 1
            entry = self.data[packageName]['features']
            entry['label'] = self.data[packageName]['label']
            data_list.append(entry)

        df = pd.DataFrame(data_list)
        df = self.clean_feature_names(df)

        X = df.drop(columns='label')
        y = df['label']

        
        accuracy_list = []
        precision_list = []
        recall_list = []
        f1_list = []
        auc_list = []
        for _ in range(1):
            kf = KFold(n_splits=10, shuffle=True)
            for train_index, test_index in kf.split(X):
                X_train, X_test = X.iloc[train_index], X.iloc[test_index]
                y_train, y_test = y.iloc[train_index], y.iloc[test_index]

                train_data = lgb.Dataset(X_train, label=y_train)
                val_data = lgb.Dataset(X_test, label=y_test, reference=train_data)

                params = {
                    'objective': 'binary',
                    'metric': 'binary_logloss', # binary_error auc binary_logloss
                    'boosting_type': 'gbdt',
                    'num_leaves': 31,
                    'max_depth': -1,
                    'learning_rate': 0.05,
                    'feature_fraction': 0.1,
                    'bagging_fraction': 1,
                    'is_unbalance': True,
                    'verbose': -1,
                    'device': 'gpu',
                }

                bst = lgb.train(
                    params,
                    train_data,
                    num_boost_round=500,
                    valid_sets=[train_data, val_data],
                    valid_names=['train', 'valid'],
                    callbacks=[lgb.early_stopping(stopping_rounds=10)]
                )

                y_pred_prob = bst.predict(X_test, num_iteration=bst.best_iteration)
                y_pred = (y_pred_prob > 0.5).astype(int)
                accuracy_list.append(accuracy_score(y_test, y_pred))
                precision_list.append(precision_score(y_test, y_pred))
                recall_list.append(recall_score(y_test, y_pred))
                f1_list.append(f1_score(y_test, y_pred))
                auc_list.append(roc_auc_score(y_test, y_pred_prob))
        print(np.sum(y == 1), np.sum(y == 0))

        MeanAccuracy = round(np.mean(accuracy_list), 4)
        MeanPrecision = round(np.mean(precision_list), 4)
        MeanRecall = round(np.mean(recall_list), 4)
        MeanF1Score = round(np.mean(f1_list), 4)
        MeanAUCScore = round(np.mean(auc_list), 4)

        print(f"Mean Accuracy: {MeanAccuracy}")
        print(f"Mean Precision: {MeanPrecision}")
        print(f"Mean Recall: {MeanRecall}")
        print(f"Mean F1 Score: {MeanF1Score}")
        print(f"Mean AUC Score: {MeanAUCScore}")

        ax = lgb.plot_importance(bst, max_num_features=20, importance_type='gain', title='Top 20 Feature Importances')
        plt.title('Top 20 Feature Importances', pad=20)
        plt.tight_layout()
        # plt.show()

        return [MeanAccuracy, MeanPrecision, MeanRecall, MeanF1Score, MeanAUCScore]

def main():
    results = []
    train = Train()
    train.prepareData('Drebin-0', ['DirectTesting', 'AntiTimebomb'], 1)
    train.prepareData('benign2-1', ['DirectTesting', 'AntiTimebomb'], 0)
    results.append(train.train())
    train = Train()
    train.prepareData('Drebin-0', ['DirectTesting'], 1)
    train.prepareData('benign2-1', ['DirectTesting'], 0)
    results.append(train.train())
    train = Train()
    train.prepareData('Drebin-0', ['AntiTimebomb'], 1)
    train.prepareData('benign2-1', ['AntiTimebomb'], 0)
    results.append(train.train())
    pprint(results)

if __name__ == '__main__':
    main()