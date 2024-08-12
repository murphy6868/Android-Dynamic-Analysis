import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
from collections import OrderedDict, defaultdict
import numpy as np
from sklearn.preprocessing import OneHotEncoder
from sklearn.neighbors import KernelDensity

from config import Config
import logUtils, logging


L = logUtils.createLogger(__name__, log_level=logging.DEBUG)

class PlotAPI:

    SAMPLING_POINTS = [30, 60, 90, 120, 150, 180]
    def __init__(self, targets):
        self.modes = Config.VALID_RUNNING_MODES
        self.targets = targets
        self.result = {
            "Total": {}, "Unique": {}
        }
        self.totalLogFilesNum = 0
        for mode in self.modes:
            self.result["Total"][mode] = OrderedDict((key, 0) for key in self.SAMPLING_POINTS)
            self.result["Unique"][mode] = OrderedDict((key, 0) for key in self.SAMPLING_POINTS)

        self.result_unique = defaultdict(
            lambda: {
                mode: OrderedDict((key, set()) for key in self.SAMPLING_POINTS) for mode in Config.VALID_RUNNING_MODES
            }
        )

        self._processLogFiles()

    def _processLogFiles(self):
        self.totalLogFilesNum = 0
        for target in self.targets:
            targetLogFilesNum = -1
            for mode in self.modes:
                logFileNames = list(
                    Config(target, mode)
                    .targetModeLogsDir
                    .glob('*.txt')
                )

                if targetLogFilesNum == -1:
                    targetLogFilesNum = len(logFileNames)
                # assert(targetLogFilesNum == len(logFileNames))

                for logFilePath in logFileNames:
                    self._processLogFile(logFilePath, mode)
            self.totalLogFilesNum += targetLogFilesNum

    def _processLogFile(self, logFilePath, mode):
        hit_SAMPLING_POINTS = 0
        packageName = logFilePath.stem
        uniqueAPIs = set()
        with open(logFilePath, "r") as file:
            for line in file:
                if line.startswith("!!!"): # !!! 180 seconds 1844 974
                    hit_SAMPLING_POINTS += 1
                    data = line.split()
                    seconds = int(data[1])
                    total = int(data[3])
                    unique = int(data[4])
                    self.result["Total"][mode][seconds] += total
                    self.result["Unique"][mode][seconds] += unique
                    self.result_unique[packageName][mode][seconds] = uniqueAPIs.copy()
                    if seconds == 180:
                        break
                        L.debug(f"{logFilePath} {mode} {total} {unique}")
                if line.startswith("+++") or line.startswith("---"):
                    api = line[line.find("=== ")+4:line.find("\n")]
                    uniqueAPIs.add(api)
        # if hit_SAMPLING_POINTS != len(self.SAMPLING_POINTS):
        #     L.critical(f"{hit_SAMPLING_POINTS} {logFilePath}")
            # exit()

    def plotAPI(self, modes):
        for metric in self.result:
            fig, ax = plt.subplots()
            y_top = 0
            ax.set_title(f'Average number of logged API calls over time ({metric})')
            # ax.set_xlim(left=0, right = list(self.SAMPLING_POINTS.items())[-1][0] + 30)
            for mode in modes:
                x_values = list(self.result[metric][mode].keys())
                y_values = list(map(lambda x: round(x / self.totalLogFilesNum, 2), self.result[metric][mode].values()))
                print(mode)
                for y in y_values:
                    print(y, end='&')
                print(' ')
                y_top = max(y_top, y_values[-1])
                ax.plot(x_values, y_values, label=mode, linestyle='-', marker='o')

                # for i, txt in enumerate(y_values):
                #     ax.annotate(f'{txt:.2f}', (x_values[i], y_values[i]), textcoords="offset points", 
                #                 xytext=(0,-10), ha='center', fontsize=7)
            ax.set_ylim(bottom=0, top=y_top+20)

            ax.set_xticks(x_values)
            ax.set_xticklabels(x_values)

            ax.set_xlabel('Seconds')
            ax.set_ylabel('Average number of logged API calls')
            ax.legend()
            plt.tight_layout()
            plt.savefig(f'{metric}.png')
            plt.show()

    def countAdditionalAPI(self, proposedModes):
        fig, ax = plt.subplots()
        for proposedMode in proposedModes:
            y_values = []
            for sp in self.SAMPLING_POINTS:
                unique = 0
                additional = 0
                for packageName in self.result_unique:
                    additional += len(self.result_unique[packageName][proposedMode][sp] - self.result_unique[packageName]["DirectTesting"][sp])
                    unique += len(self.result_unique[packageName][proposedMode][sp])
                    # if sp == 180:
                    #     print(proposedMode, packageName, self.result_unique[packageName][proposedMode][sp] - self.result_unique[packageName]["DirectTesting"][sp])
                y_values.append(unique)
                print(proposedMode, len(self.result_unique), sp, unique, additional, unique/len(self.result_unique), additional/len(self.result_unique))
            ax.plot(self.SAMPLING_POINTS, y_values, label=proposedMode, linestyle='-', marker='o')
        ax.legend()
        plt.tight_layout()
        # plt.savefig('Additional.png')
        plt.show()

    def calculateKDE(self, proposedModes):
        kde_results = {}

        # Collect all unique APIs for one-hot encoding
        allAPIs = set()
        for packageName in self.result_unique:
            for proposedMode in proposedModes:
                api_data_set = self.result_unique[packageName][proposedMode][180]
                allAPIs.update(tuple(api_data) for api_data in api_data_set)
        allAPIs = list(allAPIs)

        # Prepare one-hot encoding for all APIs
        encoder_api = OneHotEncoder(sparse_output=False)
        api_encoded = encoder_api.fit_transform(np.array(allAPIs).reshape(-1, 1))
        api_dict = {api: api_encoded[i] for i, api in enumerate(allAPIs)}

        for proposedMode in proposedModes:
            proposedMode_allAPI = []
            for packageName in self.result_unique:
                # Get the one-hot encoded API data
                api_data_set = self.result_unique[packageName][proposedMode][180]
                # api_data_set.update(self.result_unique[packageName]["DirectTesting"][180])
                for api_data in api_data_set:
                    api_onehot = api_dict[tuple(api_data)]
                    proposedMode_allAPI.append(api_onehot)
            
            # Convert to numpy array for KDE
            api_array = np.array(proposedMode_allAPI)
            
            # Fit the KDE model
            kde = KernelDensity(kernel='gaussian', bandwidth=0.1).fit(api_array)
            
            # Evaluate the density on the same points
            log_density = kde.score_samples(api_array)
            densities = np.exp(log_density)
            overall_density_score = np.mean(densities)
            # Store the result for this proposed mode
            kde_results[proposedMode] = overall_density_score
            print(proposedMode, overall_density_score)
        print(kde_results)
        return kde_results

def main():
    # plotAPI = PlotAPI(["Tekya"])
    # print(plotAPI.result_unique["allday.a24h.translate"]["TAF=2"][180])
    # print(type(plotAPI.result_unique["allday.a24h.translate"]["TAF=2"][180]))
    # exit()
    # plotAPI = PlotAPI(["TriggerZoo"])
    # plotAPI.plotAPI(["DirectTesting", "TAF=2", "TAF=3", "TAF=4", "Delay_5"])
    # print('=======================')
    # plotAPI.countAdditionalAPI(["TAF=2", "TAF=3", "TAF=4", "Delay_5"])
    # print('=======================')
    # plotAPI.calculateKDE(["DirectTesting", "TAF=2", "TAF=3", "TAF=4", "Delay_5"])


    # plotAPI = PlotAPI(["Drebin-0"])
    plotAPI = PlotAPI(["benign2-1"])
    # plotAPI.plotAPI(["DirectTesting", "AntiTimebomb"])
    plotAPI.countAdditionalAPI(["AntiTimebomb"])
    return

if __name__ == '__main__':
    main()